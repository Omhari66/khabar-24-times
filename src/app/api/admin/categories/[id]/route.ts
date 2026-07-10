import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, parseInput, requiredSlugString, requiredTrimmedString } from "@/lib/api/validation";
import { CategoryRepository } from "@/lib/repositories";
import { CategoryService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const routeParamsSchema = z.object({
  id: requiredTrimmedString("Category not found"),
});

const updateCategorySchema = z
  .object({
    name: requiredTrimmedString("Category name is required").optional(),
    slug: requiredSlugString("Category slug is required").optional(),
    parentId: z.string().nullable().optional(),
  })
  .refine((value) => value.name !== undefined || value.slug !== undefined || value.parentId !== undefined, {
    message: "No fields provided for update",
  });

const categoryService = new CategoryService(new CategoryRepository());

// PATCH update a category
export const PATCH = withApiHandler(
  { scope: "api/admin/categories:update" },
  async (req, { params }: { params: { id: string } }) => {
    await requirePermission("category.update");

    const { id: categoryId } = parseInput(params, routeParamsSchema);
    const { name, slug, parentId } = await parseJsonBody(req, updateCategorySchema);
    const updated = await categoryService.updateCategory(categoryId, { name, slug, parentId });

    return apiSuccess(updated);
  }
);

// DELETE a category
export const DELETE = withApiHandler(
  { scope: "api/admin/categories:delete" },
  async (_req, { params }: { params: { id: string } }) => {
    await requirePermission("category.delete");

    const { id: categoryId } = parseInput(params, routeParamsSchema);
    const result = await categoryService.deleteCategory(categoryId);
    return apiSuccess(result);
  }
);
