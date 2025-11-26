"use client";

import { Sparkles, Clock } from "lucide-react";

export default function ChatRoomPage() {
    return (
        <div className="h-full w-full bg-gradient-to-br from-[#1d0033] via-[#2a0a4a] to-[#1d0033] flex items-center justify-center">
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                {/* Icon */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
                        <div className="relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-8 rounded-full border border-purple-500/20">
                            <Sparkles className="w-16 h-16 text-purple-400" />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Chat Rooms
                </h1>

                {/* Coming Soon Badge */}
                <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 px-6 py-3 rounded-full mb-6">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-300 font-semibold">Coming Soon</span>
                </div>

                {/* Description */}
                <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                    We're building something amazing! Group chat rooms based on vibe matching will be available soon.
                </p>

                {/* Features Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
                    <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <div className="text-3xl mb-3">🎯</div>
                        <h3 className="text-white font-semibold mb-2">Vibe Matching</h3>
                        <p className="text-white/60 text-sm">
                            Get matched with 2-4 people who share your energy
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <div className="text-3xl mb-3">⚡</div>
                        <h3 className="text-white font-semibold mb-2">Real-time Chat</h3>
                        <p className="text-white/60 text-sm">
                            Instant messaging with auto-refresh and notifications
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                        <div className="text-3xl mb-3">🔄</div>
                        <h3 className="text-white font-semibold mb-2">Fresh Connections</h3>
                        <p className="text-white/60 text-sm">
                            New rooms every 4 hours for exciting conversations
                        </p>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-white/40 text-sm mt-12">
                    Stay tuned for updates! This feature is under development.
                </p>
            </div>
        </div>
    );
}
