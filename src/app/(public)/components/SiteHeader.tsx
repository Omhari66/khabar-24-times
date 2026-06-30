import { prisma } from "@/lib/prisma";
import SiteHeaderClient from "./SiteHeaderClient";

export default async function SiteHeader() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    take: 10,
  });

  return <SiteHeaderClient categories={categories} />;
}
