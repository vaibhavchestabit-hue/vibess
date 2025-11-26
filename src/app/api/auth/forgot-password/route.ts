import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/app/config/dbconfig";
import User from "@/src/models/userModel";
import { sendForgotPasswordEmail } from "@/src/app/helpers/sendEmail";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // For security, don't reveal if user exists or not, but for UX we might want to.
            // Let's return a generic message or specific one depending on requirements.
            // Given the previous context, explicit errors seem preferred.
            return NextResponse.json({ message: "User not found with this email" }, { status: 404 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit number

        // Save OTP and expiry (10 minutes)
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        // Send Email
        await sendForgotPasswordEmail(user.email, user.name, otp);

        return NextResponse.json({
            success: true,
            message: "OTP sent to your email",
        });

    } catch (error: any) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
