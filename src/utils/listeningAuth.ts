import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/src/models/userModel";
import connectDB from "@/src/app/config/dbconfig";

/**
 * Authenticate user from JWT token in cookies and return user document
 */
export async function authenticateListeningRequest(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
  } catch {
    return { error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }) };
  }

  await connectDB();

  const user = await User.findById(decoded.id);
  if (!user) {
    return { error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }

  return { user };
}
