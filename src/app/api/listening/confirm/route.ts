import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/app/config/dbconfig";
import User from "@/src/models/userModel";
import ListeningRequest from "@/src/models/listeningRequestModel";
import ListeningSession from "@/src/models/listeningSessionModel";
import jwt from "jsonwebtoken";

/**
 * POST /api/listening/confirm
 * Speaker confirms a listener and starts session
 */
export async function POST(req: NextRequest) {
  try {
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

    const { requestId, listenerId } = await req.json();

    if (!requestId || !listenerId) {
      return NextResponse.json(
        { error: "Request ID and Listener ID are required" },
        { status: 400 }
      );
    }

    const speaker = await User.findById(decoded.id);
    if (!speaker) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const request = await ListeningRequest.findById(requestId);
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.speaker.toString() !== speaker._id.toString()) {
      return NextResponse.json(
        { error: "You are not authorized to confirm this request" },
        { status: 403 }
      );
    }

    if (request.status !== "active") {
      return NextResponse.json(
        { error: "This request is no longer active" },
        { status: 400 }
      );
    }

    // Verify listener applied
    if (!request.interestedListeners.includes(listenerId)) {
      return NextResponse.json(
        { error: "This listener has not applied to your request" },
        { status: 400 }
      );
    }

    const listener = await User.findById(listenerId);
    if (!listener) {
      return NextResponse.json({ error: "Listener not found" }, { status: 404 });
    }

    // Create session
    const listeningSession = new ListeningSession({
      speaker: speaker._id,
      listener: listener._id,
      intent: request.intent,
      context: request.context,
      status: "active",
      startedAt: new Date(),
    });

    await listeningSession.save();

    // Update request status
    request.status = "matched";
    await request.save();

    return NextResponse.json({
      success: true,
      session: listeningSession,
      message: "Session created successfully",
    });
  } catch (error: any) {
    console.error("Error confirming listening request:", error);
    return NextResponse.json(
      { error: "Failed to confirm request", details: error.message },
      { status: 500 }
    );
  }
}
