import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNav from "./components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "EDITOR") {
    redirect("/dashboard?error=forbidden");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <AdminNav />
        {children}
      </div>
    </div>
  );
}
