import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { GalleryRepository } from "@/lib/repositories";
import { GalleryService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const createGallerySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  featuredImage: z.string().optional(),
});

const galleryService = new GalleryService(new GalleryRepository());

export const GET = withApiHandler({ scope: "api/admin/galleries:get" }, async () => {
  await requirePermission("gallery.manage");
  const galleries = await galleryService.listGalleries();
  return apiSuccess(galleries);
});

export const POST = withApiHandler({ scope: "api/admin/galleries:create" }, async (req) => {
  await requirePermission("gallery.manage");
  const body = await parseJsonBody(req, createGallerySchema);
  const gallery = await galleryService.createGallery(body);
  return apiSuccess(gallery, { status: 201 });
});
