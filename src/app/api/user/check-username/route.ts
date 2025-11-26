import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/app/config/dbconfig";
import User from "@/src/models/userModel";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const username = searchParams.get("username");

        if (!username) {
            return NextResponse.json(
                { message: "Username is required" },
                { status: 400 }
            );
        }

        // Check if username is at least 3 characters
        if (username.length < 3) {
            return NextResponse.json(
                { available: false, message: "Username must be at least 3 characters" },
                { status: 200 }
            );
        }

        // Check if username exists (case-insensitive)
        const existingUser = await User.findOne({
            username: username.toLowerCase(),
        }).select("_id");

        if (existingUser) {
            return NextResponse.json({
                available: false,
                message: "Username is already taken",
            });
        }

        return NextResponse.json({
            available: true,
            message: "Username is available",
        });
    } catch (error: any) {
        console.error("Error checking username:", error);
        return NextResponse.json(
            { message: error.message || "Failed to check username" },
            { status: 500 }
        );
    }
}
