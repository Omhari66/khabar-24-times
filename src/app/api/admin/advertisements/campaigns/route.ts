import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCampaignSchema = z.object({
  title: z.string().min(1),
  slotId: z.string().min(1),
  imageUrl: z.string().optional().nullable(),
  linkUrl: z.string().optional().nullable(),
  scriptCode: z.string().optional().nullable(),
  priority: z.coerce.number().default(0),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean().default(true),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const slotId = searchParams.get("slotId");

  try {
    const campaigns = await prisma.adCampaign.findMany({
      where: slotId ? { slotId } : undefined,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        slot: { select: { name: true } },
        _count: { select: { impressions: true } }
      }
    });
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Error fetching ad campaigns:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createCampaignSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.format() }, { status: 400 });
    }

    const { startDate, endDate, ...data } = parsed.data;

    const campaign = await prisma.adCampaign.create({
      data: {
        ...data,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      }
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Error creating ad campaign:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
