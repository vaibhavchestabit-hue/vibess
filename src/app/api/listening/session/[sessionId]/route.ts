import { NextRequest, NextResponse } from "next/server";
import { authenticateListeningRequest } from "@/src/utils/listeningAuth";
import ListeningSession from "@/src/models/listeningSessionModel";

import connectDB from "@/src/app/config/dbconfig";

/**
 * GET /api/listening/session/[sessionId]
 * Get session details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await connectDB();
    // Await params in Next.js 15+
    const { sessionId } = await params;
    console.log("GET /api/listening/session - sessionId:", sessionId);
    
    const auth = await authenticateListeningRequest(req);
    if (auth.error) {
      console.log("Authentication failed");
      return auth.error;
    }
    const user = auth.user!;
    console.log("Authenticated user:", user._id);

    // Find the session
    console.log("Searching for session with ID:", sessionId);
    const listeningSession = await ListeningSession.findById(sessionId)
      .populate("speaker listener", "name username profileImage trustScore listenerBadges");

    console.log("Session found:", listeningSession ? "YES" : "NO");
    
    if (!listeningSession) {
      console.log("Session not found in database");
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Verify user is a participant
    const isSpeaker =
      listeningSession.speaker._id.toString() === user._id.toString();
    const isListener =
      listeningSession.listener._id.toString() === user._id.toString();

    if (!isSpeaker && !isListener) {
      return NextResponse.json(
        { error: "You are not a participant in this session" },
        { status: 403 }
      );
    }

    // Check if session has expired
    listeningSession.checkExpiration();
    if (listeningSession.isModified()) {
      await listeningSession.save();
    }

    // Calculate remaining time
    const remainingTime = listeningSession.getRemainingTime();

    return NextResponse.json({
      success: true,
      session: listeningSession,
      remainingTime,
      userRole: isSpeaker ? "speaker" : "listener",
    });
  } catch (error: any) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/listening/session/[sessionId]
 * Send a message in the session
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { sessionId } = await params;
    
    const auth = await authenticateListeningRequest(req);
    if (auth.error) return auth.error;
    const user = auth.user!;

    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Message text is required" },
        { status: 400 }
      );
    }

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

    // Check if session has expired
    if (listeningSession.checkExpiration()) {
      await listeningSession.save();
      return NextResponse.json(
        { error: "Session has expired" },
        { status: 400 }
      );
    }

    // Add message
    listeningSession.messages.push({
      sender: user._id,
      text: text.trim(),
      isSystemMessage: false,
    });

    await listeningSession.save();

    // Populate for response
    await listeningSession.populate("speaker listener", "name username profileImage");

    return NextResponse.json({
      success: true,
      session: listeningSession,
      message: "Message sent successfully",
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message", details: error.message },
      { status: 500 }
    );
  }
}
