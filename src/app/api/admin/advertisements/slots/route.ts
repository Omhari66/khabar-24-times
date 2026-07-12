import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSlotSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const slots = await prisma.adSlot.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { campaigns: true }
        }
      }
    });
    return NextResponse.json(slots);
  } catch (error) {
    console.error("Error fetching ad slots:", error);
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
    const parsed = createSlotSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.format() }, { status: 400 });
    }

    const existing = await prisma.adSlot.findUnique({
      where: { name: parsed.data.name }
    });

    if (existing) {
      return NextResponse.json({ error: "Slot with this name already exists" }, { status: 400 });
    }

    const slot = await prisma.adSlot.create({
      data: parsed.data
    });

    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error("Error creating ad slot:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
