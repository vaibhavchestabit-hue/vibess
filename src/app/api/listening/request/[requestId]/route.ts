import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/app/config/dbconfig";
import User from "@/src/models/userModel";
import ListeningRequest from "@/src/models/listeningRequestModel";
import jwt from "jsonwebtoken";

/**
 * GET /api/listening/request/[requestId]
 * Get details of a specific listening request (for polling status)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
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

    const { requestId } = await params;

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    const request = await ListeningRequest.findById(requestId)
      .populate("interestedListeners", "name username profileImage trustScore listenerBadges")
      .lean();

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Verify ownership (only speaker can see details with interested listeners)
    if (request.speaker.toString() !== decoded.id) {
       // If not speaker, maybe check if it's a listener checking status?
       // For now, restrict to speaker for full details.
       return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Filter out listeners on cooldown
    const speaker = await User.findById(decoded.id).select("negativeFeedbackCooldowns");
    if (speaker && request.interestedListeners && request.interestedListeners.length > 0) {
      const now = new Date();
      const cooldownListenerIds = (speaker.negativeFeedbackCooldowns || [])
        .filter((cd: any) => cd.cooldownUntil && new Date(cd.cooldownUntil) > now)
        .map((cd: any) => cd.userId.toString());

      const filteredListeners = request.interestedListeners.filter(
        (listener: any) => !cooldownListenerIds.includes(listener._id.toString())
      );

      // Exception: If no listeners after filtering, show all (including cooldown ones)
      request.interestedListeners = filteredListeners.length > 0 ? filteredListeners : request.interestedListeners;
    }

    return NextResponse.json({ success: true, request });
  } catch (error: any) {
    console.error("Error fetching listening request:", error);
    return NextResponse.json(
      { error: "Failed to fetch request", details: error.message },
      { status: 500 }
    );
  }
}
