"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/src/store/store";
import { getUser, updateReadyToListen } from "@/src/app/lib/api";
import WantToGetHeardButton from "@/src/app/components/listening/WantToGetHeardButton";
import ListenerDashboard from "@/src/app/components/listening/ListenerDashboard";
// import TrustScoreDisplay from "@/src/app/components/listening/TrustScoreDisplay";
import { Headphones, Heart } from "lucide-react";
import toast from "react-hot-toast";

export default function ListeningPage() {
  const { setUser } = useUserStore();
  const [readyToListen, setReadyToListen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await getUser();
        if (res?.data?.user) {
          const apiUser = res.data.user;
          setUser({
            id: apiUser._id,
            name: apiUser.name,
            email: apiUser.email,
            username: apiUser.username,
            profileImage: apiUser.profileImage,
          });
          setReadyToListen(apiUser.readyToListen || false);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [setUser]);

  const handleToggle = async () => {
    const checked = !readyToListen;
    // Optimistic update
    setReadyToListen(checked);
    try {
      await updateReadyToListen(checked);
      toast.success(checked ? "You are now ready to listen! 🎧" : "You are no longer listening.");
    } catch (error) {
      console.error("Error updating status:", error);
      setReadyToListen(!checked); // Revert
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a0030]">
        <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a0030] text-white p-6 pb-24 md:pb-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Listening Space
            </h1>
            <p className="text-white/60 mt-1">
              Connect, share, and support each other.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className={`text-sm font-medium ${readyToListen ? "text-green-400" : "text-white/60"}`}>
              {readyToListen ? "Ready to Listen" : "Not Listening"}
            </span>
            <button
              onClick={handleToggle}
              className={`${
                readyToListen ? "bg-green-500" : "bg-white/20"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#1a0030]`}
            >
              <span
                className={`${
                  readyToListen ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-8">
          {readyToListen ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Listener View */}
              <div className="bg-linear-to-br from-purple-900/20 to-pink-900/20 border border-white/10 rounded-3xl p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Headphones className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Listener Dashboard</h2>
                    <p className="text-white/60 text-sm">
                      Thank you for being here. Your support means the world to someone.
                    </p>
                  </div>
                </div>
                
                <ListenerDashboard />
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Speaker View */}
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-10 h-10 text-pink-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Need someone to talk to?
                </h2>
                <p className="text-white/60 max-w-md mx-auto mb-8">
                  Everyone needs to be heard sometimes. Connect with a caring listener who will hear you out without judgment.
                </p>
                
                <div className="max-w-md mx-auto">
                  <WantToGetHeardButton />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h3 className="font-semibold text-white mb-2">Anonymous</h3>
                  <p className="text-sm text-white/60">Share your thoughts without revealing your identity if you choose.</p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h3 className="font-semibold text-white mb-2">Safe Space</h3>
                  <p className="text-sm text-white/60">A judgment-free zone where your feelings are validated.</p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h3 className="font-semibold text-white mb-2">Supportive</h3>
                  <p className="text-sm text-white/60">Connect with listeners who genuinely care and want to help.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
