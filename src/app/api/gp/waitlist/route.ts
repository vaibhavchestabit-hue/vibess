import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/app/config/dbconfig";
import User from "@/src/models/userModel";
import getUserFromToken from "@/src/app/helpers/getUserFromToken";
import { GP_CATEGORIES } from "@/src/models/groupModel";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { category } = await req.json();

        if (!category || !GP_CATEGORIES.includes(category)) {
            return NextResponse.json({ message: "Invalid category" }, { status: 400 });
        }

        // Check if already in waitlist for this category
        const currentUser = await User.findById(user._id);
        const alreadyWaiting = currentUser.gpWaitlist?.some(
            (w: any) => w.category === category
        );

        if (alreadyWaiting) {
            return NextResponse.json(
                { message: "You are already on the waitlist for this category" },
                { status: 400 }
            );
        }

        // Add to waitlist
        await User.findByIdAndUpdate(user._id, {
            $push: {
                gpWaitlist: {
                    category,
                    requestedAt: new Date(),
                    notified: false,
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: "Added to waitlist successfully",
        });
    } catch (error: any) {
        console.error("Waitlist Error:", error);
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await connectDB();
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { category } = await req.json();

        if (!category) {
            return NextResponse.json({ message: "Category required" }, { status: 400 });
        }

        // Remove from waitlist
        await User.findByIdAndUpdate(user._id, {
            $pull: {
                gpWaitlist: { category },
            },
        });

        return NextResponse.json({
            success: true,
            message: "Removed from waitlist",
        });
    } catch (error: any) {
        console.error("Waitlist Remove Error:", error);
        return NextResponse.json(
            { message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
