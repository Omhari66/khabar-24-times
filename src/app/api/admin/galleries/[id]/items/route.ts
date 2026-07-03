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

const createItemSchema = z.object({
  mediaAssetId: requiredTrimmedString("Media Asset ID is required"),
  order: z.number().int().optional(),
});

const deleteItemSchema = z.object({
  itemId: requiredTrimmedString("Item ID is required"),
});

const galleryService = new GalleryService(new GalleryRepository());

export const GET = withApiHandler(
  { scope: "api/admin/galleries:items:get" },
  async (_req, { params }: { params: { id: string } }) => {
    await requirePermission("gallery.manage");
    const { id: galleryId } = parseInput(params, routeParamsSchema);
    const items = await galleryService.getGalleryItems(galleryId);
    return apiSuccess(items);
  }
);

export const POST = withApiHandler(
  { scope: "api/admin/galleries:items:create" },
  async (req, { params }: { params: { id: string } }) => {
    await requirePermission("gallery.manage");
    const { id: galleryId } = parseInput(params, routeParamsSchema);
    const { mediaAssetId, order } = await parseJsonBody(req, createItemSchema);

    const item = await galleryService.addItemToGallery(galleryId, mediaAssetId, order);
    return apiSuccess(item, { status: 201 });
  }
);

export const DELETE = withApiHandler(
  { scope: "api/admin/galleries:items:delete" },
  async (req) => {
    await requirePermission("gallery.manage");
    const { itemId } = await parseJsonBody(req, deleteItemSchema);

    await galleryService.removeItemFromGallery(itemId);
    return apiSuccess({ success: true });
  }
);
