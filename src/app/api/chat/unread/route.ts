import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/app/config/dbconfig";
import Chat from "@/src/models/chatModel";
import getUserFromToken from "@/src/app/helpers/getUserFromToken";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userIdStr = user._id.toString();

    const chats = await Chat.find(
      { participants: user._id },
      { messages: 1 }
    ).lean();

    let latestUnreadMessage:any= null;

    const unreadCount = chats.reduce((count, chat) => {
      const unreadMessages = (chat.messages || []).filter((msg: any) => {
        const senderId =
          typeof msg.sender === "string"
            ? msg.sender
            : msg.sender?._id?.toString?.() ?? msg.sender?.toString?.();
        return senderId && senderId !== userIdStr && !msg.read;
      });

      if (unreadMessages.length > 0) {
        // Find the most recent unread message across all chats
        const lastMsg = unreadMessages[unreadMessages.length - 1];
        if (!latestUnreadMessage || new Date(lastMsg.createdAt) > new Date(latestUnreadMessage.createdAt)) {
          latestUnreadMessage = lastMsg;
        }
      }

      return count + unreadMessages.length;
    }, 0);

    // If we have a latest message, we need to populate sender details if they aren't already
    if (latestUnreadMessage) {
      // If sender is just an ID, we might need to fetch it, but let's see if we can populate it in the query first
      // For now, let's assume we need to populate it if it's missing
    }

    // Re-fetch with population if we have unread messages to get sender details efficiently
    // Or better, update the initial query to populate sender
    const chatsWithSender = await Chat.find(
      { participants: user._id },
      { messages: 1 }
    )
    .populate("messages.sender", "name profileImage")
    .lean();

    // Re-calculate with populated data to get correct sender info for the notification
    let latestMessageData: any = null;
    
    chatsWithSender.forEach((chat) => {
      const unreadMsgs = (chat.messages || []).filter((msg: any) => {
        const senderId = msg.sender?._id?.toString() || msg.sender?.toString();
        return senderId && senderId !== userIdStr && !msg.read;
      });
      
      if (unreadMsgs.length > 0) {
        const last = unreadMsgs[unreadMsgs.length - 1];
        if (!latestMessageData || new Date(last.createdAt) > new Date(latestMessageData.createdAt)) {
          latestMessageData = last;
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      unreadCount,
      latestMessage: latestMessageData 
    });
  } catch (error: any) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}

