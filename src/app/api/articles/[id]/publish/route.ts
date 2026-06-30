import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "EDITOR" && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only editors and admins can publish articles" },
        { status: 403 }
      );
    }

    const article = await prisma.article.findUnique({
      where: { id: params.id },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (article.status !== "PENDING") {
      return NextResponse.json(
        { error: "Article is not pending review" },
        { status: 409 }
      );
    }

    const updated = await prisma.article.update({
      where: { id: params.id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
        rejectionNote: null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error publishing article:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
