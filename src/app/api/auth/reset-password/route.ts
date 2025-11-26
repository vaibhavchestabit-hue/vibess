import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/app/config/dbconfig";
import User from "@/src/models/userModel";
import bcryptjs from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json(
                { message: "Email, OTP, and new password are required" },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Verify OTP
        if (!user.otp || !user.otpExpires) {
            return NextResponse.json(
                { message: "No OTP request found. Please request a new one." },
                { status: 400 }
            );
        }

        if (user.otp != otp) { // Loose equality to handle string/number differences
            return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
        }

        if (new Date() > new Date(user.otpExpires)) {
            return NextResponse.json(
                { message: "OTP has expired. Please request a new one." },
                { status: 400 }
            );
        }

        // Hash new password
        console.log("New Password:", newPassword);
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(newPassword, salt);

        // Update user
        console.log("User:", user);
        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return NextResponse.json({
            success: true,
            message: "Password reset successfully",
        });

    } catch (error: any) {
        console.error("Reset Password Error:", error);
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
