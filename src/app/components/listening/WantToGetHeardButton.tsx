"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Headphones, X, Loader2, Clock, CheckCircle, Shield } from "lucide-react";
import { requestListeningSession, getListeningRequestStatus, confirmListeningRequest } from "../../lib/vibeApi";
import { useUserStore } from "@/src/store/store";
import toast from "react-hot-toast";
import Image from "next/image";

interface InterestedListener {
  _id: string;
  name: string;
  username: string;
  profileImage?: string;
  trustScore: number;
  listenerBadges?: {
    title: string;
  };
}

export default function WantToGetHeardButton() {
  const router = useRouter();
  const { user } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"intent" | "waiting">("intent");
  const [intent, setIntent] = useState("");
  const [category, setCategory] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [interestedListeners, setInterestedListeners] = useState<InterestedListener[]>([]);
  const [confirmingListenerId, setConfirmingListenerId] = useState<string | null>(null);

  // Poll for interested listeners when in waiting step
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (step === "waiting" && activeRequestId) {
      const pollStatus = async () => {
        try {
          const response = await getListeningRequestStatus(activeRequestId);
          if (response.success && response.request) {
            setInterestedListeners(response.request.interestedListeners || []);
            
            // If request is matched or cancelled, handle accordingly
            if (response.request.status === 'matched') {
               // Maybe auto-redirect? For now let's stick to manual confirmation flow
            } else if (response.request.status === 'cancelled' || response.request.status === 'expired') {
               toast.error("Request expired or cancelled");
               setIsOpen(false);
               setStep("intent");
               setActiveRequestId(null);
            }
          }
        } catch (error) {
          console.error("Error polling status:", error);
        }
      };

      pollStatus();
      interval = setInterval(pollStatus, 5000); // Poll every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, activeRequestId]);

  const handleRequest = async () => {
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!intent) {
      toast.error("Please select what's on your mind");
      return;
    }

    setLoading(true);
    try {
      const response = await requestListeningSession(intent, context);
      
      if (response.success) {
        setActiveRequestId(response.request._id);
        setStep("waiting");
        setIsOpen(false);
        toast.success("Request broadcasted! Waiting for listeners...");
      } else {
        toast.error(response.message || "Failed to request session");
      }
    } catch (error: any) {
      console.error("Request error:", error);
      // Display the actual error message from the API
      const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmListener = async (listenerId: string) => {
    if (!activeRequestId) return;
    
    setConfirmingListenerId(listenerId);
    try {
      const response = await confirmListeningRequest(activeRequestId, listenerId);
      if (response.success) {
        toast.success("Session started! Connecting you...");
        setIsOpen(false);
        router.push(`/listening/session/${response.session._id}`);
      } else {
        toast.error(response.message || "Failed to start session");
      }
    } catch (error) {
      console.error("Confirmation error:", error);
      toast.error("Failed to confirm listener");
    } finally {
      setConfirmingListenerId(null);
    }
  };

  const intents = [
    "A thought",
    "Something heavy",
    "Just random talk",
    "I don't know",
    "Feeling overwhelmed",
  ];

  return (
    <>
      {step === "waiting" ? (
        <div className="w-full overflow-hidden rounded-2xl bg-[#1a0030] border border-white/10 shadow-lg animate-in fade-in zoom-in duration-200">
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white">Waiting for Listeners</h2>
              <p className="text-white/60">We&apos;ve broadcasted your request. Listeners will appear here.</p>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {interestedListeners.length === 0 ? (
                <div className="text-center py-8 text-white/40 border-2 border-dashed border-white/10 rounded-xl">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Waiting for someone to accept...</p>
                </div>
              ) : (
                interestedListeners.map((listener) => (
                  <div key={listener._id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 overflow-hidden relative">
                        {listener.profileImage ? (
                          <Image
                            src={listener.profileImage}
                            alt={listener.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-purple-300 font-bold">
                            {listener.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{listener.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {listener.trustScore} Trust
                          </span>
                          {listener.listenerBadges?.title && (
                            <span className="bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-300">
                              {listener.listenerBadges.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleConfirmListener(listener._id)}
                      disabled={confirmingListenerId === listener._id}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400 p-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {confirmingListenerId === listener._id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <button
              onClick={() => {
                setStep("intent");
                setActiveRequestId(null);
              }}
              className="w-full py-3 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 font-medium transition-all"
            >
              Cancel Request
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full group relative overflow-hidden rounded-2xl bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 p-px transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="relative flex items-center justify-between rounded-2xl bg-[#1a0030] px-6 py-4 transition-all group-hover:bg-opacity-90">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-pink-500/20 to-purple-500/20 ring-1 ring-white/10">
                <Headphones className="h-6 w-6 text-pink-400" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">Want to get heard?</h3>
                <p className="text-sm text-white/60">Connect with a listener now</p>
              </div>
            </div>
            <div className="rounded-full bg-white/10 p-2 transition-colors group-hover:bg-white/20">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </button>
      )}

      {isOpen && step === "intent" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md my-8 animate-in fade-in zoom-in duration-200">
            <div className="relative overflow-hidden rounded-3xl bg-[#1a0030] border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 p-2 text-white/40 hover:text-white transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Headphones className="w-8 h-8 text-pink-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">What&apos;s on your mind?</h2>
                  <p className="text-white/60">This helps us connect you with the right listener.</p>
                </div>

                {/* Category Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/80">What&apos;s this mostly about?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Work / Study",
                      "Relationships",
                      "Mental state",
                      "Family",
                      "Life / Future",
                      "Creativity",
                      "Social life",
                      "Not sure",
                    ].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          category === cat
                            ? "bg-linear-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                            : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3">
                  {intents.map((item) => (
                    <button
                      key={item}
                      onClick={() => setIntent(item)}
                      className={`w-full p-4 rounded-xl text-left transition-all border ${
                        intent === item
                          ? "bg-linear-to-r from-pink-500/20 to-purple-500/20 border-pink-500/50 text-white"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <span className="font-medium">{item}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Want to share a little more? (Optional)</label>
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Just a line or two about how you’re feeling… no pressure."
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
                  />
                </div>

                <button
                  onClick={handleRequest}
                  disabled={loading || !intent}
                  className="w-full py-4 rounded-xl bg-linear-to-r from-pink-500 to-purple-500 text-white font-bold text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Broadcasting...
                    </>
                  ) : (
                    "Find a Listener"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
