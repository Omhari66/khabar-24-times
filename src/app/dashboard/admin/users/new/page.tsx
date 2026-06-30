import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateUserClient from "./CreateUserClient";

export const dynamic = "force-dynamic";

export default async function CreateUserPage() {
  // Defense-in-depth: server-side role check (middleware also enforces this)
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard?error=forbidden");
  }

  return <CreateUserClient />;
}
