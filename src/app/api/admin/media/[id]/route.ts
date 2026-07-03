import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, parseInput, requiredTrimmedString } from "@/lib/api/validation";
import { MediaRepository } from "@/lib/repositories";
import { MediaService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const routeParamsSchema = z.object({
  id: requiredTrimmedString("Asset ID is required"),
});

const updateAssetSchema = z.object({
  altText: z.string().optional(),
  caption: z.string().optional(),
  copyright: z.string().optional(),
  photographer: z.string().optional(),
  folderId: z.string().nullable().optional(),
});

const mediaService = new MediaService(new MediaRepository());

export const GET = withApiHandler(
  { scope: "api/admin/media:item:get" },
  async (_req, { params }: { params: { id: string } }) => {
    await requirePermission("media.manage");
    const { id: assetId } = parseInput(params, routeParamsSchema);
    const asset = await mediaService.getAsset(assetId);
    return apiSuccess(asset);
  }
);

export const PATCH = withApiHandler(
  { scope: "api/admin/media:item:update" },
  async (req, { params }: { params: { id: string } }) => {
    await requirePermission("media.manage");
    const { id: assetId } = parseInput(params, routeParamsSchema);
    const body = await parseJsonBody(req, updateAssetSchema);
    const updated = await mediaService.updateAsset(assetId, body);
    return apiSuccess(updated);
  }
);

export const DELETE = withApiHandler(
  { scope: "api/admin/media:item:delete" },
  async (_req, { params }: { params: { id: string } }) => {
    await requirePermission("media.manage");
    const { id: assetId } = parseInput(params, routeParamsSchema);
    await mediaService.softDeleteAsset(assetId);
    return apiSuccess({ success: true });
  }
);
