import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/app/config/dbconfig";
import Group from "@/src/models/groupModel";
import GroupMessage from "@/src/models/groupMessageModel";
import getUserFromToken from "@/src/app/helpers/getUserFromToken";

type Params = { gpId: string };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { gpId } = await params;
    if (!gpId) {
      return NextResponse.json(
        { message: "GP ID is required" },
        { status: 400 }
      );
    }

    const gp = await Group.findById(gpId);
    if (!gp) {
      return NextResponse.json({ message: "GP not found" }, { status: 404 });
    }

    const isMember = gp.members.some(
      (member: any) => member.toString() === user._id.toString()
    );

    if (!isMember) {
      return NextResponse.json(
        { message: "You are not a member of this group" },
        { status: 403 }
      );
    }

    const messages = await GroupMessage.find({ group: gpId })
      .sort({ createdAt: 1 })
      .limit(200)
      .populate("sender", "name username profileImage");

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error: any) {
    console.error("GP Messages GET Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { gpId } = await params;
    if (!gpId) {
      return NextResponse.json(
        { message: "GP ID is required" },
        { status: 400 }
      );
    }

    const { text } = await req.json();
    if (!text || !text.trim()) {
      return NextResponse.json(
        { message: "Message text is required" },
        { status: 400 }
      );
    }

    const gp = await Group.findById(gpId);
    if (!gp) {
      return NextResponse.json({ message: "GP not found" }, { status: 404 });
    }

    const isMember = gp.members.some(
      (member: any) => member.toString() === user._id.toString()
    );

    if (!isMember) {
      return NextResponse.json(
        { message: "You are not a member of this group" },
        { status: 403 }
      );
    }

    const now = new Date();
    const isExpired =
      !gp.isPermanent &&
      (gp.status !== "active" || gp.expiresAt <= now);

    if (isExpired) {
      return NextResponse.json(
        { message: "This group has expired. Chat is locked." },
        { status: 403 }
      );
    }

    const cleanText = text.trim();
    const message = await GroupMessage.create({
      group: gp._id,
      sender: user._id,
      text: cleanText,
    });

    gp.messageCount = (gp.messageCount || 0) + 1;
    gp.lastActivityAt = now;
    if (!gp.firstMessageAt) {
      gp.firstMessageAt = now;
    }

    const becameEligible =
      !gp.isPermanentConversionEligible && gp.checkPermanentEligibility();

    if (becameEligible) {
      gp.isPermanentConversionEligible = true;
      gp.permanentConversionRequestedAt = now;
    }

    await gp.save();

    await message.populate("sender", "name username profileImage");

    return NextResponse.json({
      success: true,
      message,
      isConversionEligible: gp.isPermanentConversionEligible,
    });
  } catch (error: any) {
    console.error("GP Messages POST Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}


