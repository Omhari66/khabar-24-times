import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, parseInput, requiredTrimmedString } from "@/lib/api/validation";
import { GalleryRepository } from "@/lib/repositories";
import { GalleryService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const routeParamsSchema = z.object({
  id: requiredTrimmedString("Gallery ID is required"),
});

const updateGallerySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  featuredImage: z.string().optional(),
});

const galleryService = new GalleryService(new GalleryRepository());

export const GET = withApiHandler(
  { scope: "api/admin/galleries:item:get" },
  async (_req, { params }: { params: { id: string } }) => {
    await requirePermission("gallery.manage");
    const { id: galleryId } = parseInput(params, routeParamsSchema);
    const gallery = await galleryService.getGallery(galleryId);
    return apiSuccess(gallery);
  }
);

export const PATCH = withApiHandler(
  { scope: "api/admin/galleries:item:update" },
  async (req, { params }: { params: { id: string } }) => {
    await requirePermission("gallery.manage");
    const { id: galleryId } = parseInput(params, routeParamsSchema);
    const body = await parseJsonBody(req, updateGallerySchema);
    const updated = await galleryService.updateGallery(galleryId, body);
    return apiSuccess(updated);
  }
);

export const DELETE = withApiHandler(
  { scope: "api/admin/galleries:item:delete" },
  async (_req, { params }: { params: { id: string } }) => {
    await requirePermission("gallery.manage");
    const { id: galleryId } = parseInput(params, routeParamsSchema);
    await galleryService.deleteGallery(galleryId);
    return apiSuccess({ success: true });
  }
);
