import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, parseInput, requiredTrimmedString } from "@/lib/api/validation";
import { ArticleRepository } from "@/lib/repositories";
import { RevisionService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const routeParamsSchema = z.object({
  id: requiredTrimmedString("Article ID is required"),
});

const revisionBodySchema = z.object({
  version: z.number().int("Version must be an integer"),
});

const revisionService = new RevisionService(new ArticleRepository());

export const GET = withApiHandler(
  { scope: "api/admin/articles:revisions:list" },
  async (_req, { params }: { params: { id: string } }) => {
    await requirePermission("article.manage");
    const { id: articleId } = parseInput(params, routeParamsSchema);
    const revisions = await revisionService.listRevisions(articleId);
    return apiSuccess(revisions);
  }
);

export const POST = withApiHandler(
  { scope: "api/admin/articles:revisions:restore" },
  async (req, { params }: { params: { id: string } }) => {
    await requirePermission("article.manage");
    const { id: articleId } = parseInput(params, routeParamsSchema);
    const { version } = await parseJsonBody(req, revisionBodySchema);
    const restored = await revisionService.restoreRevision(articleId, version);
    return apiSuccess(restored);
  }
);
