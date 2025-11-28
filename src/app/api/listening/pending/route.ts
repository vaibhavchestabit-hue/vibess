import { NextRequest, NextResponse } from "next/server";
import { authenticateListeningRequest } from "@/src/utils/listeningAuth";
import ListeningSession from "@/src/models/listeningSessionModel";

/**
 * GET /api/listening/pending
 * Get pending listening requests for the current user (as listener)
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateListeningRequest(req);
    if (auth.error) return auth.error;
    const user = auth.user!;

    // Find pending sessions where user is the listener
    const pendingSessions = await ListeningSession.find({
      listener: user._id,
      status: "pending",
    })
      .populate("speaker", "name username profileImage")
      .sort({ createdAt: -1 })
      .limit(10);

    // Filter out expired requests (older than 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const validSessions = pendingSessions.filter(
      (s) => s.createdAt > fiveMinutesAgo
    );

    return NextResponse.json({
      success: true,
      sessions: validSessions,
      count: validSessions.length,
    });
  } catch (error: any) {
    console.error("Error fetching pending sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending sessions", details: error.message },
      { status: 500 }
    );
  }
}
