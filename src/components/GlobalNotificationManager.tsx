"use client";

import { useEffect, useRef, useState } from "react";
import { useUserStore } from "@/src/store/store";
import { getUnreadChatCount } from "@/src/app/lib/vibeApi";
import { getUserProfile } from "@/src/app/lib/api";
import { showChatNotification } from "@/src/app/lib/notifications";

export default function GlobalNotificationManager() {
  const { user } = useUserStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const lastMessageIdRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);

  // Check notification permission on mount and user change
  useEffect(() => {
    if (user) {
      getUserProfile().then((res: any) => {
        if (res?.data?.profile?.user?.notificationsEnabled) {
          setNotificationsEnabled(true);
        }
      });
    }
  }, [user]);

  // Poll for unread messages
  useEffect(() => {
    if (!user || !notificationsEnabled) return;

    const checkUnreadMessages = async () => {
      try {
        const res = await getUnreadChatCount();
        
        if (res.success && res.latestMessage) {
          const msg = res.latestMessage;
          const msgId = msg._id || msg.createdAt;

          // Only show notification if:
          // 1. Not initial load (don't spam on refresh)
          // 2. It's a new message we haven't seen in this session
          // 3. The tab is hidden (background)
          if (
            !isInitialLoadRef.current &&
            msgId !== lastMessageIdRef.current &&
            document.hidden
          ) {
            
            let displayText = msg.text;
            try {
              const parsed = JSON.parse(msg.text);
              if (parsed.gameData) {
                displayText = parsed.text;
              }
            } catch (e) {
              // Not a game message
            }

            showChatNotification(
              { text: displayText },
              msg.sender?.name || "Someone"
            );
          }

          lastMessageIdRef.current = msgId;
        }
        isInitialLoadRef.current = false;
      } catch (error) {
        console.error("Error checking unread messages:", error);
      }
    };

    // Check immediately
    checkUnreadMessages();

    // Then poll every 3 seconds
    const interval = setInterval(checkUnreadMessages, 3000);

    return () => clearInterval(interval);
  }, [user, notificationsEnabled]);

  return null; // This component renders nothing
}
