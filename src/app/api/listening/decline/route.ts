import { NextRequest, NextResponse } from "next/server";
import { authenticateListeningRequest } from "@/src/utils/listeningAuth";
import ListeningSession from "@/src/models/listeningSessionModel";

/**
 * POST /api/listening/decline
 * Decline a listening request
 */
export async function POST(req: NextRequest) {
  try {
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

    // Verify user is the listener
    if (listeningSession.listener.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "You are not the listener for this session" },
        { status: 403 }
      );
    }

    // Verify session is still pending
    if (listeningSession.status !== "pending") {
      return NextResponse.json(
        { error: `Session is already ${listeningSession.status}` },
        { status: 400 }
      );
    }

    // Mark session as declined
    listeningSession.status = "declined";
    await listeningSession.save();

    // TODO: Find next available listener and notify speaker
    // For now, just return success

    return NextResponse.json({
      success: true,
      message: "Session declined. No guilt - thank you for being honest! 🤍",
    });
  } catch (error: any) {
    console.error("Error declining listening session:", error);
    return NextResponse.json(
      { error: "Failed to decline session", details: error.message },
      { status: 500 }
    );
  }
}
