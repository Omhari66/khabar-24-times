import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, parseInput, requiredSlugString, requiredTrimmedString } from "@/lib/api/validation";
import { TagRepository } from "@/lib/repositories";
import { TagService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const routeParamsSchema = z.object({
  id: requiredTrimmedString("Tag not found"),
});

const updateTagSchema = z
  .object({
    name: requiredTrimmedString("Tag name is required").optional(),
    slug: requiredSlugString("Tag slug is required").optional(),
  })
  .refine((value) => value.name !== undefined || value.slug !== undefined, {
    message: "No fields provided for update",
  });

const tagService = new TagService(new TagRepository());

export const PATCH = withApiHandler(
  { scope: "api/admin/tags:update" },
  async (req, { params }: { params: { id: string } }) => {
    await requirePermission("tag.manage");
    const { id: tagId } = parseInput(params, routeParamsSchema);
    const { name, slug } = await parseJsonBody(req, updateTagSchema);
    const updated = await tagService.updateTag(tagId, { name, slug });
    return apiSuccess(updated);
  }
);

export const DELETE = withApiHandler(
  { scope: "api/admin/tags:delete" },
  async (_req, { params }: { params: { id: string } }) => {
    await requirePermission("tag.manage");
    const { id: tagId } = parseInput(params, routeParamsSchema);
    const result = await tagService.deleteTag(tagId);
    return apiSuccess(result);
  }
);
