import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { reporterCardService } from "@/lib/services/reporter-card-service";

export async function PUT(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updated = await reporterCardService.toggleStatus(params.id, session.user.id);
    return NextResponse.json(updated);
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error("Error toggling reporter card status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
