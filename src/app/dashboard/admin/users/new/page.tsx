import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateUserClient from "./CreateUserClient";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export default async function CreateUserPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard?error=forbidden");
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" }
  });

  return <CreateUserClient categories={categories} />;
}
