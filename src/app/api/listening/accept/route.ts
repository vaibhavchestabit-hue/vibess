import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/app/config/dbconfig";
import User from "@/src/models/userModel";
import ListeningRequest from "@/src/models/listeningRequestModel";
import jwt from "jsonwebtoken";

/**
 * POST /api/listening/accept
 * Listener accepts a request (applies to listen)
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    await connectDB();

    const { requestId } = await req.json();

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    const listener = await User.findById(decoded.id);
    if (!listener) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const request = await ListeningRequest.findById(requestId);
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.status !== "active") {
      return NextResponse.json(
        { error: "This request is no longer active" },
        { status: 400 }
      );
    }

    // Check if already applied
    if (request.interestedListeners.includes(listener._id)) {
      return NextResponse.json(
        { message: "You have already applied to this request" },
        { status: 200 }
      );
    }

    // Add listener to interested list
    request.interestedListeners.push(listener._id);
    await request.save();

    return NextResponse.json({
      success: true,
      message: "You have offered to listen! Waiting for speaker to accept.",
    });
  } catch (error: any) {
    console.error("Error accepting listening request:", error);
    return NextResponse.json(
      { error: "Failed to accept request", details: error.message },
      { status: 500 }
    );
  }
}
