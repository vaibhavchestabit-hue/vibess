import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/app/config/dbconfig";
import User from "@/src/models/userModel";
import jwt from "jsonwebtoken";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    // Get token from cookies
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token and get user ID
    const decoded: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    const userId = decoded.id;

    // Parse request body
    const body = await req.json();
    const { notificationsEnabled } = body;

    // Validate input
    if (typeof notificationsEnabled !== "boolean") {
      return NextResponse.json(
        { error: "notificationsEnabled must be a boolean" },
        { status: 400 }
      );
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { notificationsEnabled },
      { new: true, runValidators: true }
    ).select("-password -refreshToken -otp -otpExpires");

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    console.log("Notification preference updated successfully");
    return NextResponse.json({
      message: "Notification preference updated successfully",
      user,
      notificationsEnabled: user.notificationsEnabled,
    });
  } catch (error: any) {
    console.error("Error updating notification preference:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update notification preference" },
      { status: 500 }
    );
  }
}
