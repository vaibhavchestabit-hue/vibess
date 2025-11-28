import api from "./api";

////////////////   VIBE CARD API

export async function createVibeCard(vibeData: {
  emoji: string;
  description: string;
  energyLevel: number;
  currentIntent: string[];
  contextTag?: string;
  interactionBoundary: string;
  feelingOptions?: string[];
  vibeAvailability?: string;
  personalityPrompt?: string;
  location?: { latitude: number; longitude: number };
}) {
  try {
    const res = await api.post("/vibe/create", vibeData);
    return res.data;
  } catch (error: any) {
    console.error("Error creating vibe card:", error);
    throw error;
  }
}

export async function getMyVibeCard() {
  try {
    const res = await api.get("/vibe/my-vibe");
    return res.data;
  } catch (error: any) {
    console.error("Error fetching vibe card:", error);
    throw error;
  }
}

export async function getUserVibe(userId: string) {
  try {
    const res = await api.get(`/vibe/user/${userId}`);
    return res.data;
  } catch (error: any) {
    console.error("Error fetching user vibe:", error);
    throw error;
  }
}

export async function getVibeMatches() {
  try {
    const res = await api.get("/vibe/matches");
    return res.data;
  } catch (error: any) {
    console.error("Error fetching vibe matches:", error);
    throw error;
  }
}

export async function getVibeHeatmap(lat?: number, lng?: number, radius?: number) {
  try {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append("lat", lat.toString());
    if (lng !== undefined) params.append("lng", lng.toString());
    if (radius !== undefined) params.append("radius", radius.toString());

    const res = await api.get(`/vibe/heatmap?${params.toString()}`);
    return res.data;
  } catch (error: any) {
    console.error("Error fetching vibe heatmap:", error);
    throw error;
  }
}


////////////////   CHAT API

export async function createChat(otherUserId: string) {
  try {
    const res = await api.post("/chat/create", { otherUserId });
    return res.data;
  } catch (error: any) {
    console.error("Error creating chat:", error);
    throw error;
  }
}

export async function getChat(chatId: string) {
  try {
    const res = await api.get(`/chat/${chatId}`);
    return res.data;
  } catch (error: any) {
    console.error("Error fetching chat:", error);
    throw error;
  }
}

export async function sendMessage(chatId: string, text: string) {
  try {
    const res = await api.patch(`/chat/${chatId}`, {
      action: "sendMessage",
      text,
    });
    return res.data;
  } catch (error: any) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export async function reportChat(chatId: string, reason: string) {
  try {
    const res = await api.patch(`/chat/${chatId}`, {
      action: "report",
      reason,
    });
    return res.data;
  } catch (error: any) {
    console.error("Error reporting chat:", error);
    throw error;
  }
}

export async function blockUser(chatId: string) {
  try {
    const res = await api.patch(`/chat/${chatId}`, {
      action: "block",
    });
    return res.data;
  } catch (error: any) {
    console.error("Error blocking user:", error);
    throw error;
  }
}

export async function followUser(userId: string) {
  try {
    const res = await api.post("/user/follow", {
      userId,
      action: "follow",
    });
    return res.data;
  } catch (error: any) {
    console.error("Error following user:", error);
    throw error;
  }
}

export async function unfollowUser(userId: string) {
  try {
    const res = await api.post("/user/follow", {
      userId,
      action: "unfollow",
    });
    return res.data;
  } catch (error: any) {
    console.error("Error unfollowing user:", error);
    throw error;
  }
}

export async function followUserInChat(chatId: string) {
  try {
    const res = await api.patch(`/chat/${chatId}`, {
      action: "follow",
    });
    return res.data;
  } catch (error: any) {
    console.error("Error following user in chat:", error);
    throw error;
  }
}

export async function getMyChats() {
  try {
    const res = await api.get("/chat/my-chats");
    return res.data;
  } catch (error: any) {
    console.error("Error fetching chats:", error);
    throw error;
  }
}

export async function getUnreadChatCount() {
  try {
    const res = await api.get("/chat/unread");
    return res.data;
  } catch (error: any) {
    // Re-throw the error so the caller can handle it
    // Don't log 401 errors as they're expected when not authenticated
    if (error?.response?.status !== 401) {
      console.error("Error fetching unread chats:", error);
    }
    throw error;
  }
}

////////////////   AI API (Gemini)

export async function generateAIIcebreakers(otherUserId: string) {
  try {
    const res = await api.post("/ai/icebreakers", { otherUserId });
    return res.data;
  } catch (error: any) {
    console.error("Error generating AI icebreakers:", error);
    throw error;
  }
}

export async function enhanceVibeDescriptionAI(vibeData: {
  emoji: string;
  description: string;
  energyLevel: number;
  currentIntent: string[];
}) {
  try {
    const res = await api.post("/ai/enhance-description", vibeData);
    return res.data;
  } catch (error: any) {
    console.error("Error enhancing description:", error);
    throw error;
  }
}


////////////////   LISTENING FEATURE API

export async function requestListeningSession(intent: string, context?: string) {
  try {
    const res = await api.post("/listening/request", { intent, context });
    return res.data;
  } catch (error: any) {
    console.error("Error requesting listening session:", error);
    throw error;
  }
}

export async function getListeningRequests() {
  try {
    const res = await api.get("/listening/requests");
    return res.data;
  } catch (error: any) {
    // Don't log 403 errors - they're expected when user is not "Ready to Listen"
    if (error.response?.status !== 403) {
      console.error("Error fetching listening requests:", error);
    }
    throw error;
  }
}

export async function acceptListeningRequest(requestId: string) {
  try {
    const res = await api.post("/listening/accept", { requestId });
    return res.data;
  } catch (error: any) {
    console.error("Error accepting listening request:", error);
    throw error;
  }
}

export async function confirmListeningRequest(requestId: string, listenerId: string) {
  try {
    const res = await api.post("/listening/confirm", { requestId, listenerId });
    return res.data;
  } catch (error: any) {
    console.error("Error confirming listening request:", error);
    throw error;
  }
}

export async function getListeningRequestStatus(requestId: string) {
  // We can reuse getPendingListeningRequests or create a specific endpoint
  // For now, let's assume we can poll a specific endpoint or just reuse pending
  // Actually, we might need a specific endpoint to get a single request's status/interested listeners
  // Let's add a simple GET /listening/request/[id] if needed, or just use the existing pending one if it returns what we need.
  // But wait, getPendingListeningRequests returns *my* pending requests?
  // Let's check getPendingListeningRequests implementation.
  // It calls /listening/pending. Let's see what that does.
  // If it returns my active requests with interested listeners, that's perfect.
  try {
    const res = await api.get(`/listening/request/${requestId}`);
    return res.data;
  } catch (error: any) {
     // If the route doesn't exist yet, we might need to create it or use pending.
     // Let's stick to creating a new function and we'll ensure the backend supports it.
     // Wait, I didn't create GET /listening/request/[id].
     // I should probably create it or update getPendingListeningRequests to return the request details.
     // Let's use getPendingListeningRequests for now and filter on client side if needed, 
     // OR create the missing route.
     // Creating the route is cleaner.
     console.error("Error fetching request status:", error);
     throw error;
  }
}

export async function declineListeningRequest(sessionId: string) {
  try {
    const res = await api.post("/listening/decline", { sessionId });
    return res.data;
  } catch (error: any) {
    console.error("Error declining listening request:", error);
    throw error;
  }
}

export async function getPendingListeningRequests() {
  try {
    const res = await api.get("/listening/pending");
    return res.data;
  } catch (error: any) {
    console.error("Error fetching pending requests:", error);
    throw error;
  }
}

export async function getListeningSession(sessionId: string) {
  try {
    const res = await api.get(`/listening/session/${sessionId}`);
    return res.data;
  } catch (error: any) {
    console.error("Error fetching listening session:", error);
    throw error;
  }
}

export async function sendListeningMessage(sessionId: string, text: string) {
  try {
    const res = await api.patch(`/listening/session/${sessionId}`, { text });
    return res.data;
  } catch (error: any) {
    console.error("Error sending listening message:", error);
    throw error;
  }
}

export async function endListeningSession(sessionId: string) {
  try {
    const res = await api.post("/listening/end", { sessionId });
    return res.data;
  } catch (error: any) {
    console.error("Error ending listening session:", error);
    throw error;
  }
}

export async function submitListeningFeedback(
  sessionId: string,
  feedback: {
    speakerFeedback?: { type: string; rating?: number };
    listenerReview?: { isGenuine: boolean };
    speakerWantsReconnect?: boolean;
    listenerWantsReconnect?: boolean;
  }
) {
  try {
    const res = await api.post("/listening/feedback", {
      sessionId,
      ...feedback,
    });
    return res.data;
  } catch (error: any) {
    console.error("Error submitting listening feedback:", error);
    throw error;
  }
}

export async function reportListeningSession(sessionId: string, reason: string) {
  try {
    const res = await api.post("/listening/report", { sessionId, reason });
    return res.data;
  } catch (error: any) {
    console.error("Error reporting listening session:", error);
    throw error;
  }
}

export async function getActiveListeningSession() {
  try {
    const res = await api.get("/listening/sessions/active");
    return res.data;
  } catch (error: any) {
    console.error("Error checking active session:", error);
    throw error;
  }
}
