"use client";
import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getMyVibeCard } from "../lib/vibeApi";
import { useUserStore } from "../../store/store";

export default function RightSide() {
    const router = useRouter();
    const { user } = useUserStore();
    const [myVibe, setMyVibe] = useState<any | null>(null);
    const [myVibeLoading, setMyVibeLoading] = useState(true);
    // FLAMES game state


    useEffect(() => {
        // Only fetch if user is authenticated
        if (!user) {
            setMyVibeLoading(false);
            return;
        }

        const fetchVibe = async () => {
            try {
                const res = await getMyVibeCard();
                if (res?.vibeCard) {
                    console.log("Vibe card data:", res.vibeCard);
                    setMyVibe(res.vibeCard);
                }
            } catch (error: any) {
                // Silently handle 401 (unauthorized) - user might not be logged in or token expired
                if (error?.response?.status === 401) {
                    // User not authenticated, don't log error
                    return;
                }
                // Log other errors but don't crash
                console.error("Error fetching vibe card:", error);
            } finally {
                setMyVibeLoading(false);
            }
        };
        fetchVibe();
        
        // Refresh vibe card every 60 seconds to catch updates (reduced frequency)
        const interval = setInterval(() => {
            if (user) {
                fetchVibe();
            }
        }, 60000); // 60 seconds instead of 5 seconds
        return () => clearInterval(interval);
    }, [user]);

    const renderVibeCard = () => {
        if (myVibeLoading) {
            return (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-300" />
                </div>
            );
        }

        if (!myVibe) {
            return (
                <div className="rounded-2xl border border-dashed border-white/20 p-5 bg-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <Sparkles className="w-5 h-5 text-purple-300" />
                        <p className="text-white font-semibold text-sm">Set your vibe</p>
                    </div>
                    <p className="text-white/60 text-sm mb-4">
                        Capture how you feel right now to unlock matching vibes and 24-hour chats.
                    </p>
                    <button
                        onClick={() => router.push("/vibe/create")}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                        Create Vibe Card
                    </button>
                </div>
            );
        }

        const theme = myVibe.theme || {
            gradientFrom: "#2b1055",
            gradientTo: "#7597de",
            borderGlow: "#a855f7",
            accentColor: "#fcd34d"
        };

        return (
            <div
                className="rounded-3xl p-5 border-2 relative overflow-hidden"
                style={{
                    borderColor: theme.borderGlow,
                    backgroundImage: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
                    boxShadow: `0 0 50px ${theme.borderGlow}50`
                }}
            >
                <div className="flex items-center justify-between text-white mb-4">
                    <div className="text-4xl">{myVibe.emoji}</div>
                    <span className="text-xs uppercase tracking-[0.3em] text-white/80">Active Vibe</span>
                </div>
                <p className="text-white font-extrabold text-xl leading-snug mb-4">
                    {myVibe.description}
                </p>
                <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-white/90">
                        <div className="p-2 rounded-xl bg-white/15">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold">Energy Level: {myVibe.energyLevel || 5}/10</p>
                            <div className="w-full bg-white/10 rounded-full h-1.5 mt-1">
                                <div
                                    className="h-1.5 rounded-full"
                                    style={{
                                        width: `${((myVibe.energyLevel || 5) / 10) * 100}%`,
                                        backgroundColor: theme.accentColor,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    {myVibe.currentIntent && myVibe.currentIntent.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {myVibe.currentIntent.map((intent: string, idx: number) => (
                                <span key={idx} className="px-2 py-1 rounded-lg text-xs font-medium bg-white/15 text-white">
                                    {intent}
                                </span>
                            ))}
                        </div>
                    )}
                    {myVibe.contextTag && (
                        <p className="text-xs text-white/70">#{myVibe.contextTag}</p>
                    )}
                    <p className="text-xs text-white/60">{myVibe.interactionBoundary || "Fast replies"}</p>
                </div>

                {/* What I'm Feeling Like Today */}
                {myVibe.feelingOptions && Array.isArray(myVibe.feelingOptions) && myVibe.feelingOptions.length > 0 && (
                    <div className="mb-4 pt-3 border-t border-white/10">
                        <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                            <span style={{ color: theme.accentColor }}>✨</span>
                            Feeling Like
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {myVibe.feelingOptions.slice(0, 3).map((feeling: string, idx: number) => (
                                <span key={idx} className="px-2 py-1 rounded-full text-xs font-medium bg-white/15 text-white/90 border border-white/20">
                                    {feeling}
                                </span>
                            ))}
                            {myVibe.feelingOptions.length > 3 && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/60">
                                    +{myVibe.feelingOptions.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Vibe Availability */}
                {myVibe.vibeAvailability && myVibe.vibeAvailability.trim() !== "" && (
                    <div className="mb-4 pt-3 border-t border-white/10">
                        <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <span style={{ color: theme.accentColor }}>⚡</span>
                            Availability
                        </p>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/15 text-white border border-white/20 inline-block">
                            {myVibe.vibeAvailability}
                        </span>
                    </div>
                )}

                {/* Mini Personality Prompt */}
                {myVibe.personalityPrompt && myVibe.personalityPrompt.trim() !== "" && (
                    <div className="mb-4 pt-3 border-t border-white/10">
                        <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <span style={{ color: theme.accentColor }}>💭</span>
                            Today I feel like...
                        </p>
                        <p className="px-2.5 py-1 rounded-lg text-xs font-medium italic bg-white/15 text-white border border-white/20">
                            {myVibe.personalityPrompt}
                        </p>
                    </div>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-white/80">
                    <div className="bg-black/20 rounded-2xl px-3 py-2">
                        <p className="text-[10px] uppercase tracking-widest opacity-70">Mood</p>
                        <p className="font-semibold capitalize">{myVibe.vibeScore?.mood}</p>
                    </div>
                    <div className="bg-black/20 rounded-2xl px-3 py-2">
                        <p className="text-[10px] uppercase tracking-widest opacity-70">Energy</p>
                        <p className="font-semibold">{Math.round(myVibe.vibeScore?.energy ?? 0)}/100</p>
                    </div>
                </div>
                <div className="mt-5 flex gap-3">
                    <button
                        onClick={() => router.push("/vibe/discover")}
                        className="flex-1 py-2.5 rounded-xl bg-white/20 text-white font-semibold text-sm hover:bg-white/30 transition-all"
                    >
                        See Matches
                    </button>
                    <button
                        onClick={() => router.push("/vibe/create")}
                        className="px-4 py-2.5 rounded-xl bg-white text-purple-700 font-semibold text-sm hover:bg-white/90 transition-all"
                    >
                        Update
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full space-y-6">
            {/* Active Vibe */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Your Vibe</h3>
                </div>
                {renderVibeCard()}
            </div>

        </div>
    );
}