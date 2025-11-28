import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/app/config/dbconfig";
import User from "@/src/models/userModel";
import ListeningRequest from "@/src/models/listeningRequestModel";
import jwt from "jsonwebtoken";
import {
  checkDailyLimit,
  checkCooldown,
  checkMisuseBlock,
  getCooldownMessage,
} from "@/src/utils/listeningHelpers";

/**
 * POST /api/listening/request
 * Request a listening session (Broadcast to listeners)
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user from JWT token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    await connectDB();

    const { intent, context } = await req.json();

    // Validate intent
    const validIntents = [
      "A thought",
      "Something heavy",
      "Just random talk",
      "I don't know",
      "Feeling overwhelmed",
    ];

    if (!intent || !validIntents.includes(intent)) {
      return NextResponse.json({ error: "Invalid intent" }, { status: 400 });
    }

    // Find the requesting user by ID from JWT
    const speaker = await User.findById(decoded.id);
    if (!speaker) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is blocked for misuse
    if (checkMisuseBlock(speaker)) {
      const blockEnd = new Date(speaker.misuseTracking.blockedUntil);
      const hours = Math.ceil(
        (blockEnd.getTime() - Date.now()) / (1000 * 60 * 60)
      );
      return NextResponse.json(
        {
          error: "blocked",
          message: `You're temporarily blocked from this feature for ${hours} more hour${
            hours > 1 ? "s" : ""
          } due to misuse reports.`,
          blockedUntil: blockEnd,
        },
        { status: 403 }
      );
    }

    // Check cooldown
    if (checkCooldown(speaker)) {
      return NextResponse.json(
        {
          error: "cooldown",
          message: getCooldownMessage(speaker.listeningCooldownUntil),
          cooldownUntil: speaker.listeningCooldownUntil,
        },
        { status: 429 }
      );
    }

    // Check daily limit
    if (checkDailyLimit(speaker)) {
      return NextResponse.json(
        {
          error: "daily_limit",
          message:
            "You've reached your daily limit of 3 listening sessions. Try again tomorrow! 🤍",
        },
        { status: 429 }
      );
    }

    // If user was ready to listen, turn it off
    if (speaker.readyToListen) {
      speaker.readyToListen = false;
      await speaker.save();
    }

    // Create listening request
    const listeningRequest = new ListeningRequest({
      speaker: speaker._id,
      intent,
      context: context || "",
      status: "active",
    });

    await listeningRequest.save();

    return NextResponse.json(
      {
        success: true,
        request: listeningRequest,
        message: "Request broadcasted to listeners",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error requesting listening session:", error);
    return NextResponse.json(
      { error: "Failed to request session", details: error.message },
      { status: 500 }
    );
  }
}
