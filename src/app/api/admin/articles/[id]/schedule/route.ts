import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, parseInput, requiredTrimmedString } from "@/lib/api/validation";
import { ArticleRepository } from "@/lib/repositories";
import { SchedulingService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const routeParamsSchema = z.object({
  id: requiredTrimmedString("Article ID is required"),
});

const scheduleSchema = z.object({
  date: z.string().transform((val) => new Date(val)),
});

const schedulingService = new SchedulingService(new ArticleRepository());

export const POST = withApiHandler(
  { scope: "api/admin/articles:schedule" },
  async (req, { params }: { params: { id: string } }) => {
    await requirePermission("article.schedule");
    const { id: articleId } = parseInput(params, routeParamsSchema);
    const { date } = await parseJsonBody(req, scheduleSchema);

    const result = await schedulingService.scheduleArticlePublish(articleId, date);
    return apiSuccess(result);
  }
);
