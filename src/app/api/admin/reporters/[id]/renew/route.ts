import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { reporterCardService } from "@/lib/services/reporter-card-service";
import { z } from "zod";
import { parseJsonBody } from "@/lib/api/validation";

const renewSchema = z.object({
  validTill: z.coerce.date(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { validTill } = await parseJsonBody(req, renewSchema);
    const updated = await reporterCardService.renewCard(params.id, validTill, session.user.id);

    return NextResponse.json(updated);
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error("Error renewing reporter card:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
