import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slotName = searchParams.get("slotName");

  if (!slotName) {
    return NextResponse.json({ error: "Missing slotName" }, { status: 400 });
  }

  try {
    const now = new Date();
    // Find active campaign for this slot with highest priority
    const campaign = await prisma.adCampaign.findFirst({
      where: {
        slot: { name: slotName },
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" }
      ]
    });

    if (!campaign) {
      return NextResponse.json(null);
    }

    // We don't want to expose impressions or internal ids if not needed, but we need id for logging
    return NextResponse.json({
      id: campaign.id,
      title: campaign.title,
      imageUrl: campaign.imageUrl,
      linkUrl: campaign.linkUrl,
      scriptCode: campaign.scriptCode,
    });
  } catch (error) {
    console.error("Error serving ad:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
