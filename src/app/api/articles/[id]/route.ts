import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "REPORTER" && role !== "EDITOR" && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const articleId = params.id;
    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!existingArticle) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const isAuthor = existingArticle.authorId === session.user.id;
    // Editors and Admins bypass the author-ownership check — they can edit any article's content.
    // Status transitions (publish/reject) are handled by dedicated endpoints, not this PATCH route.
    const isEditorOrAdmin = role === "EDITOR" || role === "ADMIN";

    // Security check: Only the author or an Editor/Admin can edit
    if (!isAuthor && !isEditorOrAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You are not the author of this article" },
        { status: 403 }
      );
    }

    // Security check: Only DRAFT or REJECTED status restriction applies to authors who are not Editors/Admins
    if (isAuthor && !isEditorOrAdmin) {
      if (
        existingArticle.status !== "DRAFT" &&
        existingArticle.status !== "REJECTED"
      ) {
        return NextResponse.json(
          { error: "Forbidden: You can only edit articles in DRAFT or REJECTED status" },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { title, slug, content, coverImageUrl, categoryId, status } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = typeof title === "string" ? title.trim() : title;
    if (slug !== undefined) updateData.slug = typeof slug === "string" ? slug.trim().toLowerCase() : slug;
    if (content !== undefined) updateData.content = content;
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    if (status !== undefined) {
      if (status !== "DRAFT" && status !== "PENDING") {
        return NextResponse.json(
          { error: "Bad Request: Status must be exactly DRAFT or PENDING" },
          { status: 400 }
        );
      }
      updateData.status = status;
      if (status === "PENDING") {
        updateData.rejectionNote = null;
      }
    }

    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: updateData,
    });

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error("Error updating article:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "An article with this slug already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "REPORTER" && role !== "EDITOR" && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: { category: true },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (role === "REPORTER" && article.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "REPORTER" && role !== "EDITOR" && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const article = await prisma.article.findUnique({
      where: { id: params.id },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Reporters can only delete their own articles
    if (role === "REPORTER" && article.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only DRAFT articles can be deleted (no destroying published/pending content)
    if (article.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only draft articles can be deleted" },
        { status: 409 }
      );
    }

    await prisma.article.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
