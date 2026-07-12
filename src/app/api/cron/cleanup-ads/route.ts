import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // In a real production app with Vercel, you would check for the CRON_SECRET:
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    const now = new Date();
    
    // Delete all ad campaigns where the endDate is in the past
    const result = await prisma.adCampaign.deleteMany({
      where: {
        endDate: {
          lt: now
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} expired ad campaigns.`
    });
  } catch (error) {
    console.error("Error cleaning up expired ads:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
