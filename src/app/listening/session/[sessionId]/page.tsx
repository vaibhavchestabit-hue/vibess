"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getListeningSession,
  sendListeningMessage,
  endListeningSession,
  submitListeningFeedback,
  reportListeningSession,
} from "@/src/app/lib/vibeApi";
import { formatTimeRemaining } from "@/src/utils/listeningHelpers";
import { Send, AlertCircle, Clock, X, Heart, Meh, ThumbsDown } from "lucide-react";

export default function ListeningSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  interface Message {
    sender: string;
    text: string;
    isSystemMessage: boolean;
    createdAt: string;
  }

  interface Session {
    _id: string;
    status: "pending" | "active" | "completed" | "cancelled" | "declined";
    messages: Message[];
    speaker: { _id: string; name: string };
    listener: { _id: string; name: string };
    speakerFeedback?: any;
    listenerReview?: any;
  }

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [userRole, setUserRole] = useState<"speaker" | "listener" | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSession = async () => {
    try {
      const response = await getListeningSession(sessionId);
      if (response.success) {
        setSession(response.session);
        setRemainingTime(response.remainingTime || 0);
        setUserRole(response.userRole);

        // Show feedback modal if session is completed and feedback not submitted
        if (response.session.status === "completed") {
          const isSpeaker = response.userRole === "speaker";
          const isListener = response.userRole === "listener";

          if (isSpeaker && !response.session.speakerFeedback) {
            setShowFeedbackModal(true);
          } else if (isListener && !response.session.listenerReview) {
            setShowFeedbackModal(true);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSession();
      const interval = setInterval(fetchSession, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  // Update remaining time every second
  useEffect(() => {
    if (remainingTime > 0 && session?.status === "active") {
      const timer = setInterval(() => {
        setRemainingTime((prev) => Math.max(0, prev - 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [remainingTime, session?.status]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      await sendListeningMessage(sessionId, message);
      setMessage("");
      await fetchSession();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleEndSession = async () => {
    if (!confirm("Are you sure you want to end this session?")) return;

    try {
      await endListeningSession(sessionId);
      await fetchSession();
      setShowFeedbackModal(true);
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0118] via-[#1d0033] to-[#2a0044]">
        <div className="text-white">Loading session...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0118] via-[#1d0033] to-[#2a0044]">
        <div className="text-white">Session not found</div>
      </div>
    );
  }

  const otherParticipant =
    userRole === "speaker" ? session.listener : session.speaker;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#0a0118] via-[#1d0033] to-[#2a0044]">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
              {otherParticipant?.name?.charAt(0) || "U"}
            </div>
            <div>
              <p className="font-semibold text-white">
                {otherParticipant?.name || "Unknown"}
              </p>
              <p className="text-xs text-white/60">
                {userRole === "speaker" ? "Listening to you" : "Sharing with you"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {session.status === "active" && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 rounded-full">
                <Clock className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-medium text-purple-200">
                  {formatTimeRemaining(remainingTime)}
                </span>
              </div>
            )}

            <button
              onClick={() => setShowReportModal(true)}
              className="p-2 rounded-full hover:bg-white/10 transition"
              title="Report"
            >
              <AlertCircle className="w-5 h-5 text-white/60" />
            </button>

            {session.status === "active" && (
              <button
                onClick={handleEndSession}
                className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-sm font-medium transition"
              >
                End Session
              </button>
            )}
          </div>
        </div>

        {/* Rules */}
        <div className="max-w-4xl mx-auto mt-3 p-3 bg-blue-500/10 border border-blue-400/30 rounded-xl">
          <p className="text-sm text-blue-200 text-center">
            🎧 This is a listening space • No judging • No forcing advice
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {session.messages?.map((msg: Message, index: number) => {
            const isMe =
              (userRole === "speaker" && msg.sender === session.speaker._id) ||
              (userRole === "listener" && msg.sender === session.listener._id);

            return (
              <div
                key={index}
                className={`flex ${
                  msg.isSystemMessage
                    ? "justify-center"
                    : isMe
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {msg.isSystemMessage ? (
                  <div className="px-4 py-2 bg-white/5 rounded-full text-sm text-white/60">
                    {msg.text}
                  </div>
                ) : (
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                      isMe
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isMe ? "text-white/60" : "text-white/40"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {session.status === "active" && (
        <div className="bg-white/5 border-t border-white/10 p-4">
          <form
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto flex gap-3"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          sessionId={sessionId}
          userRole={userRole}
          onClose={() => {
            setShowFeedbackModal(false);
            router.push("/app-home");
          }}
        />
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          sessionId={sessionId}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}

// Feedback Modal Component
function FeedbackModal({
  sessionId,
  userRole,
  onClose,
}: {
  sessionId: string;
  userRole: "speaker" | "listener" | null;
  onClose: () => void;
}) {
  const [feedbackType, setFeedbackType] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [isGenuine, setIsGenuine] = useState<boolean | null>(null);
  const [wantsReconnect, setWantsReconnect] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const feedback: any = {};

      if (userRole === "speaker") {
        feedback.speakerFeedback = {
          type: feedbackType,
          rating: feedbackType === "neutral" ? undefined : rating,
        };
        feedback.speakerWantsReconnect = wantsReconnect;
      } else if (userRole === "listener") {
        feedback.listenerReview = { isGenuine: isGenuine === true };
        feedback.listenerWantsReconnect = wantsReconnect;
      }

      await submitListeningFeedback(sessionId, feedback);
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#1a0033] to-[#2a0044] border border-white/10 rounded-3xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6">
          {userRole === "speaker" ? "Did this help you?" : "Was this genuine?"}
        </h2>

        {userRole === "speaker" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => setFeedbackType("positive")}
                className={`flex-1 p-4 rounded-xl border transition ${
                  feedbackType === "positive"
                    ? "bg-green-500/20 border-green-400"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <Heart className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">Yes 🤍</p>
              </button>
              <button
                onClick={() => setFeedbackType("neutral")}
                className={`flex-1 p-4 rounded-xl border transition ${
                  feedbackType === "neutral"
                    ? "bg-blue-500/20 border-blue-400"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <Meh className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">A little</p>
              </button>
              <button
                onClick={() => setFeedbackType("negative")}
                className={`flex-1 p-4 rounded-xl border transition ${
                  feedbackType === "negative"
                    ? "bg-red-500/20 border-red-400"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <ThumbsDown className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">Not really</p>
              </button>
            </div>

            {(feedbackType === "positive" || feedbackType === "negative") && (
              <div>
                <p className="text-white/70 mb-2">Rate your experience (0-10)</p>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-center text-2xl font-bold text-white mt-2">
                  {rating}
                </p>
              </div>
            )}
          </div>
        )}

        {userRole === "listener" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => setIsGenuine(true)}
                className={`flex-1 p-4 rounded-xl border transition ${
                  isGenuine === true
                    ? "bg-green-500/20 border-green-400"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <p className="text-white">Genuine</p>
              </button>
              <button
                onClick={() => setIsGenuine(false)}
                className={`flex-1 p-4 rounded-xl border transition ${
                  isGenuine === false
                    ? "bg-red-500/20 border-red-400"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <p className="text-white">Just for fun / misuse</p>
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-white/5 rounded-xl">
          <p className="text-white/70 mb-3">
            Do you want to talk to this person again sometime?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setWantsReconnect(true)}
              className={`flex-1 px-4 py-2 rounded-xl border transition ${
                wantsReconnect
                  ? "bg-purple-500/20 border-purple-400"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <p className="text-sm text-white">Yes, notify me</p>
            </button>
            <button
              onClick={() => setWantsReconnect(false)}
              className={`flex-1 px-4 py-2 rounded-xl border transition ${
                !wantsReconnect
                  ? "bg-purple-500/20 border-purple-400"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <p className="text-sm text-white">No, keep it fresh</p>
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={
            submitting ||
            (userRole === "speaker" && !feedbackType) ||
            (userRole === "listener" && isGenuine === null)
          }
          className="w-full mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </div>
  );
}

// Report Modal Component
function ReportModal({
  sessionId,
  onClose,
}: {
  sessionId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;

    setSubmitting(true);
    try {
      await reportListeningSession(sessionId, reason);
      alert("Report submitted successfully");
      onClose();
    } catch (error) {
      console.error("Error reporting session:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#1a0033] to-[#2a0044] border border-white/10 rounded-3xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Report Session</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe what happened..."
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
        />

        <button
          onClick={handleSubmit}
          disabled={!reason.trim() || submitting}
          className="w-full mt-4 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </div>
  );
}
