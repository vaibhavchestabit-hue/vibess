import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/src/models/userModel";

/**
 * Authenticate user from JWT token in cookies
 * Returns user object if authenticated, null otherwise
 */
export async function authenticateUser(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return null;
    }

    // Verify JWT
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    } catch {
      return null;
    }

    // Fetch user
    const user = await User.findById(decoded.id);
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error authenticating user:", error);
    return null;
  }
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}
