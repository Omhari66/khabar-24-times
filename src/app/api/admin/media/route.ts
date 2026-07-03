import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { MediaRepository } from "@/lib/repositories";
import { MediaService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  parentId: z.string().nullable().optional(),
});

const createAssetSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  mimeType: z.string(),
  fileSize: z.number().int().positive(),
  url: z.string().url(),
  altText: z.string().optional(),
  caption: z.string().optional(),
  copyright: z.string().optional(),
  photographer: z.string().optional(),
  folderId: z.string().optional(),
});

const mediaService = new MediaService(new MediaRepository());

export const GET = withApiHandler({ scope: "api/admin/media:get" }, async (req) => {
  await requirePermission("media.manage");
  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("folderId");
  const type = searchParams.get("type");

  if (type === "folder") {
    const folders = await mediaService.listFolders(folderId);
    return apiSuccess(folders);
  }

  const assets = await mediaService.listAssets(folderId);
  return apiSuccess(assets);
});

export const POST = withApiHandler({ scope: "api/admin/media:create" }, async (req) => {
  await requirePermission("media.manage");
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (type === "folder") {
    const body = await parseJsonBody(req, createFolderSchema);
    const folder = await mediaService.createFolder(body.name, body.parentId);
    return apiSuccess(folder, { status: 201 });
  }

  const body = await parseJsonBody(req, createAssetSchema);
  const asset = await mediaService.createAsset(body);
  return apiSuccess(asset, { status: 201 });
});
