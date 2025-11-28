import { NextRequest, NextResponse } from "next/server";
import { authenticateListeningRequest } from "@/src/utils/listeningAuth";
import ListeningSession from "@/src/models/listeningSessionModel";

/**
 * GET /api/listening/sessions/active
 * Get the current active session for the user (as listener or speaker)
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateListeningRequest(req);
    if (auth.error) return auth.error;
    const user = auth.user!;

    // Find active session where user is listener or speaker
    const session = await ListeningSession.findOne({
      $or: [{ listener: user._id }, { speaker: user._id }],
      status: "active",
    })
      .select("_id speaker listener startedAt")
      .populate("speaker listener", "name profileImage")
      .sort({ createdAt: -1 });

    if (!session) {
      return NextResponse.json({ active: false });
    }

    return NextResponse.json({
      active: true,
      sessionId: session._id,
      role: session.speaker._id.toString() === user._id.toString() ? "speaker" : "listener",
      partner: session.speaker._id.toString() === user._id.toString() ? session.listener : session.speaker,
    });
  } catch (error: any) {
    console.error("Error checking active session:", error);
    return NextResponse.json(
      { error: "Failed to check active session" },
      { status: 500 }
    );
  }
}
