/**
 * Browser Notification Utilities for Vibess
 */

/**
 * Check if browser supports notifications
 */
export function checkNotificationSupport(): boolean {
  return "Notification" in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!checkNotificationSupport()) {
    return "denied";
  }
  return Notification.permission;
}

/**
 * Request notification permission from the browser
 * @returns Promise that resolves to the permission status
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!checkNotificationSupport()) {
    console.warn("Browser does not support notifications");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "denied";
  }
}

/**
 * Show a chat notification
 * @param message - The message object containing text and sender info
 * @param sender - The sender's name
 */
export function showChatNotification(message: { text: string }, sender: string): void {
  if (!checkNotificationSupport()) {
    console.warn("Browser does not support notifications");
    return;
  }

  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted");
    return;
  }

  try {
    console.log("showing notification");    
    const notification = new Notification(`New message from ${sender}`, {
      body: message.text.length > 100 ? message.text.substring(0, 100) + "..." : message.text,
      icon: "/logo.png",
      badge: "/logo.png",
      tag: "vibess-chat", // Prevents duplicate notifications
      requireInteraction: false,
      silent: false,
    });

    // Focus the window when notification is clicked
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  } catch (error) {
    console.error("Error showing notification:", error);
  }
}

/**
 * Check if notifications are enabled and permission is granted
 */
export function canShowNotifications(): boolean {
  return checkNotificationSupport() && Notification.permission === "granted";
}
