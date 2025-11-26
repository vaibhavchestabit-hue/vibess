"use client";

import { useEffect, useState } from "react";
import { Search, Users, Clock, MapPin } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Group {
  _id: string;
  category: string;
  subType: string;
  specificName?: string;
  genre?: string;
  talkTopics: string[];
  description?: string;
  creationReason?: string;
  reasonNote?: string;
  memberCount: number;
  maxMembers: number;
  timeLeft: number;
  distance?: number;
  city?: string;
  zone?: string;
  createdBy: {
    _id: string;
    username: string;
    profileImage?: string;
  };
}

/* ---------------- Group Card Component ---------------- */
function GroupCard({ group }: { group: Group }) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);

  const handleJoinGroup = async () => {
    try {
      setJoining(true);
      const response = await axios.post("/api/gp/join", { gpId: group._id });
      if (response.data.success) {
        router.push("/groups");
      }
    } catch (error: any) {
      console.error("Failed to join group:", error);
    } finally {
      setJoining(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m left`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m left`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Vibe GP":
        return "from-pink-500/20 to-purple-500/20 border-pink-500/30";
      case "Movie GP":
        return "from-blue-500/20 to-cyan-500/20 border-blue-500/30";
      case "Anime GP":
        return "from-orange-500/20 to-red-500/20 border-orange-500/30";
      case "Other GP":
        return "from-green-500/20 to-teal-500/20 border-green-500/30";
      default:
        return "from-purple-500/20 to-pink-500/20 border-purple-500/30";
    }
  };

  return (
    <div className={`bg-gradient-to-br ${getCategoryColor(group.category)} rounded-xl p-4 border backdrop-blur-sm hover:shadow-lg transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-semibold text-sm">{group.category}</span>
            <span className="text-white/60 text-xs">•</span>
            <span className="text-white/80 text-xs">{group.subType}</span>
          </div>
          {group.specificName && (
            <p className="text-white/90 text-sm font-medium mb-1">{group.specificName}</p>
          )}
          {group.genre && (
            <p className="text-white/70 text-xs">{group.genre}</p>
          )}
        </div>
        <div className="flex items-center gap-1 text-white/60 text-xs">
          <Users className="w-3 h-3" />
          <span>{group.memberCount}/{group.maxMembers}</span>
        </div>
      </div>

      {/* Talk Topics */}
      <div className="flex flex-wrap gap-1 mb-2">
        {group.talkTopics.slice(0, 2).map((topic, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 bg-white/10 rounded-full text-white/80 text-xs"
          >
            {topic}
          </span>
        ))}
        {group.talkTopics.length > 2 && (
          <span className="px-2 py-0.5 bg-white/10 rounded-full text-white/60 text-xs">
            +{group.talkTopics.length - 2}
          </span>
        )}
      </div>

      {/* Description */}
      {group.description && (
        <p className="text-white/70 text-xs mb-2 line-clamp-2">{group.description}</p>
      )}

      {/* Reason */}
      {group.creationReason && (
        <div className="text-white/60 text-xs mb-3">
          <span className="font-medium">{group.creationReason}</span>
          {group.reasonNote && <span className="ml-1">• {group.reasonNote}</span>}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-white/60 text-xs">
          {group.distance !== undefined && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{group.distance} km</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatTime(group.timeLeft)}</span>
          </div>
        </div>
        <button
          onClick={handleJoinGroup}
          disabled={joining || group.memberCount >= group.maxMembers}
          className="px-4 py-1.5 bg-white text-purple-700 rounded-lg text-xs font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {joining ? "Joining..." : group.memberCount >= group.maxMembers ? "Full" : "Join"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Main Explore Page ---------------- */
export default function ExplorePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch groups
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("/api/gp/explore");
      if (response.data.success) {
        setGroups(response.data.gps);
      }
    } catch (err: any) {
      console.error("Failed to fetch groups:", err);
      setError(err.response?.data?.message || "Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  // Filter groups by search query
  const filteredGroups = groups.filter((group) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const displayName = (
      group.specificName ||
      group.genre ||
      group.subType ||
      ""
    ).toLowerCase();

    return (
      displayName.includes(query) ||
      group.category.toLowerCase().includes(query) ||
      group.talkTopics.some((topic) => topic.toLowerCase().includes(query)) ||
      (group.description || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 text-white">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Explore Groups</h1>
        <p className="text-white/60">
          Find and join groups that match your interests
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
        <Search className="w-5 h-5 text-white/60" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search groups by name, topic, or description..."
          className="flex-1 bg-transparent outline-none text-white placeholder-white/40"
        />
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-white/60">Loading groups...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-red-400">{error}</div>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-white/60 text-lg mb-2">
            {searchQuery ? "No groups found" : "No groups available"}
          </div>
          <p className="text-white/40 text-sm">
            {searchQuery
              ? "Try a different search term"
              : "Check back later for new groups"}
          </p>
        </div>
      ) : (
        <>
          <div className="text-sm text-white/50 mb-4">
            Found {filteredGroups.length} group{filteredGroups.length !== 1 ? "s" : ""}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
