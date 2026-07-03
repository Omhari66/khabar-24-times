import React from "react";
import MediaLibrary from "@/app/dashboard/components/MediaLibrary";
import { requireSession } from "@/lib/api/auth";
import { PermissionRepository } from "@/lib/repositories/permission-repository";
import { PermissionService } from "@/lib/services/permission-service";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Media Library | Admin Dashboard",
};

export default async function AdminMediaPage() {
  const session = await requireSession();
  
  const permissionService = new PermissionService(new PermissionRepository());
  const hasPerm = await permissionService.hasPermission(
    session.user.id,
    session.user.role,
    "media.manage"
  );

  if (!hasPerm) {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Media Library</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage all uploaded images, videos, and files across the news platform.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <MediaLibrary selectionMode="none" />
      </div>
    </div>
  );
}
