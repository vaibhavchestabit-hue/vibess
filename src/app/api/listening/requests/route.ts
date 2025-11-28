import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/app/config/dbconfig";
import User from "@/src/models/userModel";
import ListeningRequest from "@/src/models/listeningRequestModel";
import jwt from "jsonwebtoken";

/**
 * GET /api/listening/requests
 * Fetch active listening requests for listeners
 */
export async function GET(req: NextRequest) {
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

    const listener = await User.findById(decoded.id);
    if (!listener) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only allow if "Ready to Listen" is on
    if (!listener.readyToListen) {
      return NextResponse.json(
        { error: "You must be 'Ready to Listen' to see requests" },
        { status: 403 }
      );
    }

    // Find active requests
    // Exclude requests from users blocked by listener
    // Exclude requests from users who blocked listener
    const blockedUsers = listener.blockedUsers || [];
    
    const requests = await ListeningRequest.find({
      status: "active",
      speaker: { $ne: listener._id, $nin: blockedUsers },
      expiresAt: { $gt: new Date() },
    })
      .populate("speaker", "name username profileImage trustScore")
      .sort({ createdAt: -1 })
      .lean();

    // Filter out requests where speaker blocked listener (needs separate check or aggregation)
    // For simplicity, we'll do it in JS for now or trust the request creation logic to filter?
    // Actually, request creation doesn't filter listeners, it broadcasts.
    // So we should filter here.
    
    const validRequests = [];
    for (const req of requests) {
      const speaker = await User.findById(req.speaker._id).select("blockedUsers");
      if (speaker && !speaker.blockedUsers.includes(listener._id)) {
        // Add flag if already interested
        const isInterested = req.interestedListeners.some(
          (id: any) => id.toString() === listener._id.toString()
        );
        validRequests.push({ ...req, hasApplied: isInterested });
      }
    }

    // Filter out requests from speakers on cooldown
    const now = new Date();
    const cooldownSpeakerIds = (listener.negativeFeedbackCooldowns || [])
      .filter((cd: any) => cd.cooldownUntil && new Date(cd.cooldownUntil) > now)
      .map((cd: any) => cd.userId.toString());

    const filteredRequests = validRequests.filter(
      (req: any) => !cooldownSpeakerIds.includes(req.speaker._id.toString())
    );

    // Exception: If no requests after filtering, show all (including cooldown ones)
    const finalRequests = filteredRequests.length > 0 ? filteredRequests : validRequests;

    return NextResponse.json({ success: true, requests: finalRequests });
  } catch (error: any) {
    console.error("Error fetching listening requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests", details: error.message },
      { status: 500 }
    );
  }
}
