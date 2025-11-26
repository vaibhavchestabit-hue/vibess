"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Clock,
  Loader2,
  MapPin,
  MessageSquare,
  Send,
  Users,
} from "lucide-react";
import { useUserStore } from "@/src/store/store";
import {
  getGPDetails,
  getGroupMessages,
  sendGroupMessage,
} from "@/src/app/lib/api";

type GroupMember = {
  _id: string;
  name: string;
  username: string;
  profileImage?: string;
};

type GroupDetail = {
  _id: string;
  category: string;
  subType: string;
  specificName?: string;
  genre?: string;
  talkTopics: string[];
  description?: string;
  creationReason: string;
  reasonNote?: string;
  members: GroupMember[];
  memberCount: number;
  maxMembers: number;
  createdBy: GroupMember;
  moderator?: GroupMember;
  expiresAt: string;
  timeLeft: number | null;
  status: string;
  isPermanent: boolean;
  isPermanentConversionEligible: boolean;
  isMember: boolean;
  city?: string;
  zone?: string;
  location?: {
    city?: string;
    zone?: string;
    coordinates?: number[];
  };
};

type GroupMessage = {
  _id: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  sender: GroupMember;
};

export default function GroupChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUserStore();
  const gpId = params?.gpId as string | undefined;

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const loadGroup = useCallback(async () => {
    if (!gpId) return;
    setLoadingGroup(true);
    try {
      const res = await getGPDetails(gpId);
      if (res.success && res.gp) {
        if (!res.gp.isMember) {
          toast.error("You are not a member of this group");
          router.push("/groups");
          return;
        }
        setGroup(res.gp);
      } else {
        toast.error(res.message || "Failed to load group");
        router.push("/groups");
      }
    } catch (error: any) {
      console.error("Failed to load group", error);
      toast.error(error?.response?.data?.message || "Failed to load group");
      router.push("/groups");
    } finally {
      setLoadingGroup(false);
    }
  }, [gpId, router]);

  const loadMessages = useCallback(async () => {
    if (!gpId) return;
    try {
      const res = await getGroupMessages(gpId);
      if (res.success) {
        setMessages(res.messages || []);
      }
    } catch (error: any) {
      console.error("Failed to load messages", error);
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  }, [gpId]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  useEffect(() => {
    loadMessages();
    if (!gpId) return;
    const interval = setInterval(() => {
      loadMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, [gpId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const canChat = useMemo(() => {
    if (!group) return false;
    if (group.isPermanent) return true;
    if (group.status !== "active") return false;
    return new Date(group.expiresAt) > new Date();
  }, [group]);

  const formatTimeLeft = (minutes: number | null) => {
    if (minutes === null) return "Permanent";
    if (minutes <= 0) return "Expired";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m left`;
    return `${hrs}h ${mins}m left`;
  };

  const handleSendMessage = async () => {
    if (!gpId || !messageText.trim() || sending) return;
    const text = messageText.trim();
    setSending(true);
    try {
      const res = await sendGroupMessage(gpId, text);
      if (res.success) {
        setMessageText("");
        await loadMessages();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (value: string) => {
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const locationText = useMemo(() => {
    const city = group?.city || group?.location?.city;
    const zone = group?.zone || group?.location?.zone;
    return [city, zone].filter(Boolean).join(", ");
  }, [group]);

  if (loadingGroup) {
    return (
      <div className="min-h-full w-full bg-linear-to-br from-[#0a0118] via-[#1d0033] to-[#2a0044] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="h-full w-full bg-linear-to-br from-[#0a0118] via-[#1d0033] to-[#2a0044] flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-white/70">Group not found.</p>
          <button
            onClick={() => router.push("/groups")}
            className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full bg-linear-to-br from-[#0a0118] via-[#1d0033] to-[#2a0044] flex flex-col">
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col px-4 py-6 gap-4">
        <button
          onClick={() => router.push("/groups")}
          className="flex items-center gap-2 text-white/70 hover:text-white transition max-w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to My Groups</span>
        </button>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <span>{group.category}</span>
                <span>•</span>
                <span>{group.subType}</span>
                {group.specificName && (
                  <>
                    <span>•</span>
                    <span>{group.specificName}</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-300" />
                Group Chat
              </h1>
              {group.description && (
                <p className="text-white/70 text-sm mt-1">{group.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-2xl border border-white/10">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-white text-sm font-medium">
                  {formatTimeLeft(group.timeLeft)}
                </span>
              </div>
              {group.isPermanent && (
                <span className="px-3 py-1 rounded-2xl bg-green-500/20 text-green-300 text-xs font-semibold border border-green-500/30">
                  Permanent
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>
                {group.memberCount}/{group.maxMembers} members
              </span>
            </div>
            {locationText && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{locationText}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {group.talkTopics.map((topic) => (
                <span
                  key={topic}
                  className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {group.members.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10"
              >
                {member.profileImage ? (
                  <Image
                    src={member.profileImage}
                    alt={member.name}
                    width={28}
                    height={28}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                    {member.name?.[0] || "U"}
                  </div>
                )}
                <span className="text-white text-xs font-medium">
                  {member.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 flex flex-col">
          {loadingMessages ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-purple-300" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-white/70 space-y-3">
              <MessageSquare className="w-10 h-10 text-white/30" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-500/40">
              {messages.map((msg) => {
                const isOwn = msg.sender?._id === user?.id;
                return (
                  <div
                    key={msg._id || `${msg.sender?._id}-${msg.createdAt}-${msg.text}`}
                    className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                      {msg.sender?.profileImage ? (
                        <Image
                          src={msg.sender.profileImage}
                          alt={msg.sender.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                          {msg.sender?.name?.[0] || "U"}
                        </div>
                      )}
                    </div>
                    <div className={`max-w-[70%] ${isOwn ? "text-right" : ""}`}>
                      {!isOwn && (
                        <p className="text-xs text-white/60 mb-1">
                          {msg.sender?.name}
                        </p>
                      )}
                      <div
                        className={`inline-block px-4 py-2 rounded-2xl ${
                          isOwn
                            ? "bg-linear-to-r from-purple-500 to-pink-500 text-white"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <p className="text-white/40 text-xs mt-1 px-2">
                        {formatTimestamp(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="mt-4">
            {!canChat ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center text-red-300 text-sm">
                This group has expired. You can no longer send messages.
              </div>
            ) : (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={sending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !messageText.trim()}
                  className="px-6 py-3 rounded-2xl bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


