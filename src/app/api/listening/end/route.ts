import { NextRequest, NextResponse } from "next/server";
import { authenticateListeningRequest } from "@/src/utils/listeningAuth";
import ListeningSession from "@/src/models/listeningSessionModel";

import connectDB from "@/src/app/config/dbconfig";

/**
 * POST /api/listening/end
 * End a listening session early (either party can end)
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticateListeningRequest(req);
    if (auth.error) return auth.error;
    const user = auth.user!;

    const { sessionId } = await req.json();

    // Find the session
    const listeningSession = await ListeningSession.findById(sessionId);
    if (!listeningSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Verify user is a participant
    const isSpeaker =
      listeningSession.speaker.toString() === user._id.toString();
    const isListener =
      listeningSession.listener.toString() === user._id.toString();

    if (!isSpeaker && !isListener) {
      return NextResponse.json(
        { error: "You are not a participant in this session" },
        { status: 403 }
      );
    }

    // Verify session is active
    if (listeningSession.status !== "active") {
      return NextResponse.json(
        { error: "Session is not active" },
        { status: 400 }
      );
    }

    // End the session
    listeningSession.status = "completed";
    listeningSession.endedAt = new Date();

    await listeningSession.save();

    return NextResponse.json({
      success: true,
      session: listeningSession,
      message: "Session ended successfully",
    });
  } catch (error: any) {
    console.error("Error ending session:", error);
    return NextResponse.json(
      { error: "Failed to end session", details: error.message },
      { status: 500 }
    );
  }
}
