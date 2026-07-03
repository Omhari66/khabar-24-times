import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, parseInput, requiredTrimmedString } from "@/lib/api/validation";
import { ArticleRepository } from "@/lib/repositories";
import { SEOService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const routeParamsSchema = z.object({
  id: requiredTrimmedString("Article ID is required"),
});

const seoUpdateSchema = z.object({
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  canonicalUrl: z.string().nullable().optional(),
  ogImageUrl: z.string().nullable().optional(),
  twitterImageUrl: z.string().nullable().optional(),
  focusKeyword: z.string().nullable().optional(),
  schemaOverride: z.any().nullable().optional(),
  robotsOverride: z.string().nullable().optional(),
});

const seoService = new SEOService(new ArticleRepository());

export const PATCH = withApiHandler(
  { scope: "api/admin/articles:seo:update" },
  async (req, { params }: { params: { id: string } }) => {
    await requirePermission("article.manage");
    const { id: articleId } = parseInput(params, routeParamsSchema);
    const body = await parseJsonBody(req, seoUpdateSchema);

    const result = await seoService.updateArticleSEO(articleId, body);
    return apiSuccess(result);
  }
);
