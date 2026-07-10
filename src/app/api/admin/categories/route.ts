import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, requiredSlugString, requiredTrimmedString } from "@/lib/api/validation";
import { CategoryRepository } from "@/lib/repositories";
import { CategoryService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const createCategorySchema = z.object({
  name: requiredTrimmedString("Category name is required"),
  slug: requiredSlugString("Category slug is required"),
  parentId: z.string().optional().nullable(),
});

const categoryService = new CategoryService(new CategoryRepository());

// GET all categories (with article counts)
export const GET = withApiHandler({ scope: "api/admin/categories:get" }, async () => {
  await requirePermission("category.view");

  const categories = await categoryService.listCategories();

  return apiSuccess(categories);
});

// POST create a new category
export const POST = withApiHandler({ scope: "api/admin/categories:create" }, async (req) => {
  await requirePermission("category.create");

  const { name, slug, parentId } = await parseJsonBody(req, createCategorySchema);
  const category = await categoryService.createCategory({ name, slug, parentId: parentId ?? undefined });

  return apiSuccess(category, { status: 201 });
});
