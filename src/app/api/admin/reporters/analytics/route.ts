import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { reporterCardService } from "@/lib/services/reporter-card-service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await reporterCardService.getAnalyticsOverview();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching reporter card analytics:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
