import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, parseInput, requiredTrimmedString } from "@/lib/api/validation";
import { TagRepository } from "@/lib/repositories";
import { TagService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const routeParamsSchema = z.object({
  id: requiredTrimmedString("Source tag ID is required"),
});

const mergeSchema = z.object({
  targetTagId: requiredTrimmedString("Target tag ID is required"),
});

const tagService = new TagService(new TagRepository());

export const POST = withApiHandler(
  { scope: "api/admin/tags:merge" },
  async (req, { params }: { params: { id: string } }) => {
    await requirePermission("tag.manage");
    const { id: sourceTagId } = parseInput(params, routeParamsSchema);
    const { targetTagId } = await parseJsonBody(req, mergeSchema);

    const result = await tagService.mergeTags(sourceTagId, targetTagId);
    return apiSuccess(result);
  }
);
