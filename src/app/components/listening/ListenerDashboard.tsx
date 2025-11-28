"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getListeningRequests,
  acceptListeningRequest,
  getActiveListeningSession,
} from "@/src/app/lib/vibeApi";
import { User, Clock, MessageCircle, Heart } from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface ListeningRequest {
  _id: string;
  speaker: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  intent: string;
  context?: string;
  createdAt: string;
  hasApplied?: boolean;
}

export default function ListenerDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState<ListeningRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const response = await getListeningRequests();
      if (response.success) {
        setRequests(response.requests);
      }
    } catch (error: any) {
      // Silently handle 403 errors (user not ready to listen yet)
      if (error.response?.status === 403) {
        console.log("User must be 'Ready to Listen' to see requests");
        setRequests([]);
      } else {
        console.error("Error fetching requests:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkActiveSession = async () => {
    try {
      const response = await getActiveListeningSession();
      if (response.active && response.sessionId) {
        toast.success("Active session found! Redirecting...");
        router.push(`/listening/session/${response.sessionId}`);
      }
    } catch (error) {
      console.error("Error checking active session:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
    checkActiveSession();
    // Poll every 5 seconds for requests and active sessions
    const interval = setInterval(() => {
      fetchRequests();
      checkActiveSession();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (requestId: string) => {
    setAcceptingId(requestId);
    try {
      const response = await acceptListeningRequest(requestId);
      if (response.success) {
        toast.success("Request accepted! Waiting for speaker to confirm.");
        // Update local state to show applied status
        setRequests((prev) =>
          prev.map((req) =>
            req._id === requestId ? { ...req, hasApplied: true } : req
          )
        );
      } else {
        toast.error(response.message || "Failed to accept request");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10">
        <Heart className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No active requests</h3>
        <p className="text-white/60">
          Waiting for someone to share their thoughts...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-purple-400" />
        People wanting to be heard
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {requests.map((request) => (
          <div
            key={request._id}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden relative">
                  {request.speaker.profileImage ? (
                    <Image
                      src={request.speaker.profileImage}
                      alt={request.speaker.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-purple-300" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-white">{request.speaker.name}</p>
                  <p className="text-xs text-white/60 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(request.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-500/30">
                {request.intent}
              </span>
            </div>

            {request.context && (
              <p className="text-white/80 text-sm mb-4 bg-black/20 p-3 rounded-xl">
                "{request.context}"
              </p>
            )}

            <button
              onClick={() => handleAccept(request._id)}
              disabled={request.hasApplied || acceptingId === request._id}
              className={`w-full py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                request.hasApplied
                  ? "bg-green-500/20 text-green-300 cursor-default"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              {request.hasApplied ? (
                <>
                  <Heart className="w-4 h-4 fill-current" />
                  Applied
                </>
              ) : acceptingId === request._id ? (
                <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
              ) : (
                "I'm here to listen"
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
