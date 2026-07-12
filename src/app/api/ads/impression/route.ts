import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const impressionSchema = z.object({
  campaignId: z.string().min(1),
  type: z.enum(["VIEW", "CLICK"]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = impressionSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await prisma.adImpression.create({
      data: {
        campaignId: parsed.data.campaignId,
        type: parsed.data.type,
        ipAddress: ip,
        userAgent: userAgent,
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error logging ad impression:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
