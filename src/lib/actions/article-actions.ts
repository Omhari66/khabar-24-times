"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addComment(articleId: string, content: string, slug: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!content.trim()) {
    throw new Error("Comment cannot be empty");
  }

  await prisma.comment.create({
    data: {
      content,
      articleId,
      userId: session.user.id,
    },
  });

  revalidatePath(`/article/${slug}`);
  return { success: true };
}

export async function toggleLike(articleId: string, slug: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const existingLike = await prisma.articleLike.findUnique({
    where: {
      articleId_userId: {
        articleId,
        userId: session.user.id,
      },
    },
  });

  let added = false;
  if (existingLike) {
    await prisma.articleLike.delete({
      where: {
        id: existingLike.id,
      },
    });
  } else {
    await prisma.articleLike.create({
      data: {
        articleId,
        userId: session.user.id,
      },
    });
    added = true;
  }

  revalidatePath(`/article/${slug}`);
  return { success: true, added };
}
