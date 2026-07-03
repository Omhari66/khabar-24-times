import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, requiredSlugString, requiredTrimmedString } from "@/lib/api/validation";
import { TagRepository } from "@/lib/repositories";
import { TagService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const createTagSchema = z.object({
  name: requiredTrimmedString("Tag name is required"),
  slug: requiredSlugString("Tag slug is required"),
});

const tagService = new TagService(new TagRepository());

export const GET = withApiHandler({ scope: "api/admin/tags:get" }, async () => {
  await requirePermission("tag.manage");
  const tags = await tagService.listTags();
  return apiSuccess(tags);
});

export const POST = withApiHandler({ scope: "api/admin/tags:create" }, async (req) => {
  await requirePermission("tag.manage");
  const { name, slug } = await parseJsonBody(req, createTagSchema);
  const tag = await tagService.createTag({ name, slug });
  return apiSuccess(tag, { status: 201 });
});
