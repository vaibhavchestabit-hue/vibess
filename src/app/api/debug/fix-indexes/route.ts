import { NextResponse } from "next/server";
import connectDB from "@/src/app/config/dbconfig";
import VibeCard from "@/src/models/vibeCardModel";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    
    // syncIndexes() will drop indexes that are not in the schema and create new ones
    const result = await VibeCard.syncIndexes();
    
    // Also list current indexes to verify
    const indexes = await VibeCard.listIndexes();

    return NextResponse.json({
      success: true,
      message: "Indexes synced successfully",
      result,
      currentIndexes: indexes
    });
  } catch (error: any) {
    console.error("Error syncing indexes:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
