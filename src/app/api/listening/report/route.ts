import { NextRequest, NextResponse } from "next/server";
import { authenticateListeningRequest } from "@/src/utils/listeningAuth";
import ListeningSession from "@/src/models/listeningSessionModel";

/**
 * POST /api/listening/report
 * Report a listening session for abuse/harassment
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateListeningRequest(req);
    if (auth.error) return auth.error;
    const user = auth.user!;

    const { sessionId, reason } = await req.json();

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

    // Add report
    listeningSession.reportedBy.push({
      user: user._id,
      reason: reason.trim(),
      reportedAt: new Date(),
    });

    await listeningSession.save();

    // TODO: Implement moderation workflow
    // - Flag for admin review
    // - Send notification to moderation team
    // - Potentially auto-block for severe violations

    return NextResponse.json({
      success: true,
      message:
        "Report submitted successfully. Our team will review this shortly.",
    });
  } catch (error: any) {
    console.error("Error reporting session:", error);
    return NextResponse.json(
      { error: "Failed to report session", details: error.message },
      { status: 500 }
    );
  }
}
