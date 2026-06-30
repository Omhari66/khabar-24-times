import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "REPORTER" && role !== "EDITOR" && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, slug, content, coverImageUrl, categoryId, status } = body;
    const normalizedTitle = typeof title === "string" ? title.trim() : "";
    const normalizedSlug = typeof slug === "string" ? slug.trim().toLowerCase() : "";

    if (!normalizedTitle || !normalizedSlug || !content || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, content, categoryId" },
        { status: 400 }
      );
    }

    // Enforce status to DRAFT or PENDING only
    const articleStatus = status === "PENDING" ? "PENDING" : "DRAFT";

    const article = await prisma.article.create({
      data: {
        title: normalizedTitle,
        slug: normalizedSlug,
        content,
        coverImageUrl,
        status: articleStatus,
        authorId: session.user.id,
        categoryId,
        rejectionNote: null,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "A similar article slug already exists, please try again" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "REPORTER" && role !== "EDITOR" && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Reporters can only see their own articles
    const whereClause = role === "REPORTER" ? { authorId: session.user.id } : {};

    const articles = await prisma.article.findMany({
      where: whereClause,
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
