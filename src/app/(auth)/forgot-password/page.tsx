"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { forgotPassword, resetPassword } from "../../lib/api";
import toast from "react-hot-toast";
import { Loader2, Mail, Lock, ArrowRight, KeyRound, CheckCircle2, ChevronLeft, Eye, EyeOff } from "lucide-react";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");

    // Step 2 State
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Floating emojis for background
    const emojis = ["🤔", "🔑", "🔒", "📧", "✨", "🔄"];

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        try {
            setLoading(true);
            await forgotPassword(email);
            toast.success("OTP sent to your email! 📧");
            setStep(2);
        } catch (error: any) {
            toast.error(error.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otp || !newPassword || !confirmPassword) {
            toast.error("All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);
            await resetPassword({ email, otp, newPassword });
            toast.success("Password reset successfully! 🎉");
            router.push("/login");
        } catch (error: any) {
            toast.error(error.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1d0033] via-[#2a0a4a] to-[#1d0033] text-white relative overflow-hidden flex items-center justify-center p-4">
            {/* Floating Emojis Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {emojis.map((emoji, idx) => (
                    <div
                        key={idx}
                        className="absolute text-4xl opacity-10 animate-float"
                        style={{
                            left: `${(idx * 20) % 100}%`,
                            top: `${(idx * 15) % 100}%`,
                            animationDelay: `${idx * 0.5}s`,
                            animationDuration: `${4 + (idx % 3)}s`,
                        }}
                    >
                        {emoji}
                    </div>
                ))}
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
                        <KeyRound className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                        {step === 1 ? "Forgot Password?" : "Reset Password"}
                    </h1>
                    <p className="text-white/70 text-sm">
                        {step === 1
                            ? "Don't worry, we'll help you get back in."
                            : "Enter the OTP sent to your email and set a new password."}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">

                    {step === 1 ? (
                        // STEP 1: Email Input
                        <form onSubmit={handleSendOTP} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your registered email"
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        Send OTP
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        // STEP 2: OTP & New Password
                        <form onSubmit={handleResetPassword} className="space-y-5">

                            {/* OTP Input */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Enter OTP
                                </label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter 6-digit OTP"
                                        required
                                        maxLength={6}
                                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all tracking-widest"
                                    />
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                        minLength={6}
                                        className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <CheckCircle2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    <>
                                        Reset Password
                                        <CheckCircle2 className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Back to Login */}
                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        {step === 2 ? (
                            <button
                                onClick={() => setStep(1)}
                                className="text-white/60 hover:text-white text-sm transition-colors inline-flex items-center gap-1 mb-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Change Email
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="text-white/60 hover:text-white text-sm transition-colors inline-flex items-center gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back to Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
