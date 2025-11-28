import { NextRequest, NextResponse } from "next/server";
import { authenticateListeningRequest } from "@/src/utils/listeningAuth";
import User from "@/src/models/userModel";
import ListeningSession from "@/src/models/listeningSessionModel";
import {
  calculateTrustScore,
  calculateListenerBadge,
  updateDailyUsage,
  calculateCooldown,
} from "@/src/utils/listeningHelpers";

/**
 * POST /api/listening/feedback
 * Submit session feedback (speaker feedback, listener review, continuity)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateListeningRequest(req);
    if (auth.error) return auth.error;
    const user = auth.user!;

    const {
      sessionId,
      speakerFeedback,
      listenerReview,
      speakerWantsReconnect,
      listenerWantsReconnect,
    } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
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

    // Verify session is completed
    if (listeningSession.status !== "completed") {
      return NextResponse.json(
        { error: "Session must be completed before submitting feedback" },
        { status: 400 }
      );
    }

    // Process speaker feedback
    if (isSpeaker && speakerFeedback) {
      const { type, rating } = speakerFeedback;

      if (!["positive", "negative", "neutral"].includes(type)) {
        return NextResponse.json(
          { error: "Invalid feedback type" },
          { status: 400 }
        );
      }

      // Validate rating for positive/negative feedback
      if (
        (type === "positive" || type === "negative") &&
        (rating === undefined || rating < 0 || rating > 10)
      ) {
        return NextResponse.json(
          { error: "Rating must be between 0 and 10" },
          { status: 400 }
        );
      }

      // Save speaker feedback
      listeningSession.speakerFeedback = {
        type,
        rating: type === "neutral" ? undefined : rating,
        submittedAt: new Date(),
      };

      // Save continuity preference
      if (speakerWantsReconnect !== undefined) {
        listeningSession.speakerWantsReconnect = speakerWantsReconnect;
      }

      // Update listener's trust score and stats
      const listener = await User.findById(listeningSession.listener);
      if (listener) {
        // Calculate new trust score
        const newTrustScore = calculateTrustScore(
          listener.trustScore || 75,
          type,
          rating
        );
        listener.trustScore = newTrustScore;

        // Update session stats
        listener.sessionStats = listener.sessionStats || {
          totalSessions: 0,
          positiveSessions: 0,
          negativeSessions: 0,
          neutralSessions: 0,
        };
        listener.sessionStats.totalSessions += 1;

        if (type === "positive") {
          listener.sessionStats.positiveSessions += 1;
        } else if (type === "negative") {
          listener.sessionStats.negativeSessions += 1;
        } else {
          listener.sessionStats.neutralSessions += 1;
        }

        // Update badge
        const newBadge = calculateListenerBadge(
          listener.sessionStats.positiveSessions
        );
        listener.listenerBadges = newBadge;

        // Update continuity preferences
        if (speakerWantsReconnect && !listener.preferredListeners) {
          listener.preferredListeners = [];
        }
        if (
          speakerWantsReconnect &&
          !listener.preferredListeners.includes(user._id)
        ) {
          // Note: This adds the speaker to the listener's preferred list
          // In practice, we want the speaker's preferred list updated
        }

        await listener.save();
      }

      // Update speaker's usage tracking
      const usageUpdate = updateDailyUsage(user);
      user.listeningUsage = usageUpdate;

      // Check for cooldown
      const cooldownDate = calculateCooldown(usageUpdate.consecutiveDays);
      if (cooldownDate) {
        user.listeningCooldownUntil = cooldownDate;
      }

      // Update speaker's preferred listeners
      if (speakerWantsReconnect) {
        if (!user.preferredListeners) {
          user.preferredListeners = [];
        }
        if (!user.preferredListeners.includes(listeningSession.listener)) {
          user.preferredListeners.push(listeningSession.listener);
        }
      } else if (speakerWantsReconnect === false) {
        // Speaker doesn't want to reconnect - add 48-hour cooldown
        const cooldownEnd = new Date();
        cooldownEnd.setHours(cooldownEnd.getHours() + 48);

        // Add to speaker's cooldowns
        if (!user.negativeFeedbackCooldowns) {
          user.negativeFeedbackCooldowns = [];
        }
        // Remove existing cooldown for this listener if any
        user.negativeFeedbackCooldowns = user.negativeFeedbackCooldowns.filter(
          (cd: any) => cd.userId.toString() !== listeningSession.listener.toString()
        );
        user.negativeFeedbackCooldowns.push({
          userId: listeningSession.listener,
          cooldownUntil: cooldownEnd,
        });

        // Add to listener's cooldowns (mutual)
        const listener = await User.findById(listeningSession.listener);
        if (listener) {
          if (!listener.negativeFeedbackCooldowns) {
            listener.negativeFeedbackCooldowns = [];
          }
          listener.negativeFeedbackCooldowns = listener.negativeFeedbackCooldowns.filter(
            (cd: any) => cd.userId.toString() !== user._id.toString()
          );
          listener.negativeFeedbackCooldowns.push({
            userId: user._id,
            cooldownUntil: cooldownEnd,
          });
          await listener.save();
        }
      }

      await user.save();
    }

    // Process listener review
    if (isListener && listenerReview !== undefined) {
      const { isGenuine } = listenerReview;

      if (typeof isGenuine !== "boolean") {
        return NextResponse.json(
          { error: "isGenuine must be a boolean" },
          { status: 400 }
        );
      }

      // Save listener review
      listeningSession.listenerReview = {
        isGenuine,
        submittedAt: new Date(),
      };

      // Save continuity preference
      if (listenerWantsReconnect !== undefined) {
        listeningSession.listenerWantsReconnect = listenerWantsReconnect;
      }

      // Handle misuse tracking
      if (!isGenuine) {
        const speaker = await User.findById(listeningSession.speaker);
        if (speaker) {
          // Initialize misuse tracking if needed
          if (!speaker.misuseTracking) {
            speaker.misuseTracking = {
              notGenuineReports: 0,
              reportedBy: [],
              blockedUntil: null,
            };
          }

          // Only count if this listener hasn't reported this speaker before
          if (!speaker.misuseTracking.reportedBy.includes(user._id)) {
            speaker.misuseTracking.notGenuineReports += 1;
            speaker.misuseTracking.reportedBy.push(user._id);

            // Apply 48-hour block if 3+ reports from different listeners
            if (speaker.misuseTracking.notGenuineReports >= 3) {
              const blockEnd = new Date();
              blockEnd.setHours(blockEnd.getHours() + 48);
              speaker.misuseTracking.blockedUntil = blockEnd;
            }

            await speaker.save();
          }
        }
      }

      // Update listener's preferred speakers
      if (listenerWantsReconnect) {
        if (!user.preferredListeners) {
          user.preferredListeners = [];
        }
        if (!user.preferredListeners.includes(listeningSession.speaker)) {
          user.preferredListeners.push(listeningSession.speaker);
        }
        await user.save();
      } else if (listenerWantsReconnect === false) {
        // Listener doesn't want to reconnect - add 48-hour cooldown
        const cooldownEnd = new Date();
        cooldownEnd.setHours(cooldownEnd.getHours() + 48);

        // Add to listener's cooldowns
        if (!user.negativeFeedbackCooldowns) {
          user.negativeFeedbackCooldowns = [];
        }
        // Remove existing cooldown for this speaker if any
        user.negativeFeedbackCooldowns = user.negativeFeedbackCooldowns.filter(
          (cd: any) => cd.userId.toString() !== listeningSession.speaker.toString()
        );
        user.negativeFeedbackCooldowns.push({
          userId: listeningSession.speaker,
          cooldownUntil: cooldownEnd,
        });

        // Add to speaker's cooldowns (mutual)
        const speaker = await User.findById(listeningSession.speaker);
        if (speaker) {
          if (!speaker.negativeFeedbackCooldowns) {
            speaker.negativeFeedbackCooldowns = [];
          }
          speaker.negativeFeedbackCooldowns = speaker.negativeFeedbackCooldowns.filter(
            (cd: any) => cd.userId.toString() !== user._id.toString()
          );
          speaker.negativeFeedbackCooldowns.push({
            userId: user._id,
            cooldownUntil: cooldownEnd,
          });
          await speaker.save();
        }
        await user.save();
      }
    }

    await listeningSession.save();

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
      session: listeningSession,
    });
  } catch (error: any) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback", details: error.message },
      { status: 500 }
    );
  }
}
