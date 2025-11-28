"use client";

interface TrustScoreDisplayProps {
  trustScore: number;
  sessionStats: {
    totalSessions: number;
    positiveSessions: number;
    negativeSessions: number;
    neutralSessions: number;
  };
  listenerBadges: {
    level: number;
    title: string;
  };
}

const BADGE_MILESTONES = [
  { level: 0, title: "New Listener", minSessions: 0, icon: "🌱" },
  { level: 1, title: "Trusted Listener", minSessions: 25, icon: "🤍" },
  { level: 2, title: "Comfort Giver", minSessions: 50, icon: "🔷" },
  { level: 3, title: "Emotional Supporter", minSessions: 100, icon: "🌟" },
  { level: 4, title: "Safe Space Creator", minSessions: 150, icon: "👑" },
  { level: 5, title: "Community Pillar", minSessions: 250, icon: "🛡" },
  { level: 6, title: "Vibess Guardian", minSessions: 500, icon: "✨" },
];

export default function TrustScoreDisplay({
  trustScore,
  sessionStats,
  listenerBadges,
}: TrustScoreDisplayProps) {
  const currentBadge = BADGE_MILESTONES.find(
    (b) => b.level === listenerBadges.level
  ) || BADGE_MILESTONES[0];

  const nextBadge = BADGE_MILESTONES.find(
    (b) => b.level === listenerBadges.level + 1
  );

  const progress = nextBadge
    ? (sessionStats.positiveSessions / nextBadge.minSessions) * 100
    : 100;

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-white/10 rounded-3xl p-6 space-y-6">
      {/* Trust Score */}
      <div>
        <h3 className="text-sm uppercase tracking-wider text-white/60 mb-2">
          Trust Score
        </h3>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-white">{trustScore}</span>
          <span className="text-xl text-white/60 mb-1">/ 150</span>
        </div>
        <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
            style={{ width: `${(trustScore / 150) * 100}%` }}
          />
        </div>
      </div>

      {/* Session Stats */}
      <div>
        <h3 className="text-sm uppercase tracking-wider text-white/60 mb-3">
          Sessions Listened
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-white/60">Total</p>
            <p className="text-2xl font-bold text-white">
              {sessionStats.totalSessions}
            </p>
          </div>
          <div className="bg-green-500/10 rounded-xl p-3">
            <p className="text-xs text-green-300">Positive</p>
            <p className="text-2xl font-bold text-green-200">
              {sessionStats.positiveSessions}
            </p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-3">
            <p className="text-xs text-red-300">Negative</p>
            <p className="text-2xl font-bold text-red-200">
              {sessionStats.negativeSessions}
            </p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-3">
            <p className="text-xs text-blue-300">Neutral</p>
            <p className="text-2xl font-bold text-blue-200">
              {sessionStats.neutralSessions}
            </p>
          </div>
        </div>
      </div>

      {/* Badge */}
      <div>
        <h3 className="text-sm uppercase tracking-wider text-white/60 mb-3">
          Listener Badge
        </h3>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{currentBadge.icon}</span>
            <div>
              <p className="font-semibold text-white">{currentBadge.title}</p>
              <p className="text-xs text-white/60">Level {currentBadge.level}</p>
            </div>
          </div>

          {nextBadge && (
            <>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                  <span>Next: {nextBadge.icon} {nextBadge.title}</span>
                  <span>
                    {sessionStats.positiveSessions} / {nextBadge.minSessions}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            </>
          )}

          {!nextBadge && (
            <p className="text-sm text-purple-300 mt-2">
              🎉 Maximum badge level achieved!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
