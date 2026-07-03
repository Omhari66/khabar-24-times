import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, parseInput, requiredSlugString, requiredTrimmedString } from "@/lib/api/validation";
import { AuthorRepository } from "@/lib/repositories";
import { AuthorService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const routeParamsSchema = z.object({
  id: requiredTrimmedString("Author ID not found"),
});

const updateAuthorSchema = z
  .object({
    bio: z.string().optional(),
    slug: requiredSlugString("Slug is required").optional(),
    avatarUrl: z.string().optional(),
    socialLinks: z.record(z.string(), z.string()).optional(),
  })
  .refine(
    (val) =>
      val.bio !== undefined ||
      val.slug !== undefined ||
      val.avatarUrl !== undefined ||
      val.socialLinks !== undefined,
    { message: "No fields provided for update" }
  );

const authorService = new AuthorService(new AuthorRepository());

export const GET = withApiHandler(
  { scope: "api/admin/authors:item:get" },
  async (_req, { params }: { params: { id: string } }) => {
    const { id } = parseInput(params, routeParamsSchema);
    const author = id.includes("-")
      ? await authorService.getAuthor(id)
      : await authorService.getAuthorBySlug(id);
    return apiSuccess(author);
  }
);

export const PATCH = withApiHandler(
  { scope: "api/admin/authors:item:update" },
  async (req, { params }: { params: { id: string } }) => {
    await requirePermission("author.manage");
    const { id: authorId } = parseInput(params, routeParamsSchema);
    const body = await parseJsonBody(req, updateAuthorSchema);
    const updated = await authorService.updateAuthor(authorId, body);
    return apiSuccess(updated);
  }
);

export const DELETE = withApiHandler(
  { scope: "api/admin/authors:item:delete" },
  async (_req, { params }: { params: { id: string } }) => {
    await requirePermission("author.manage");
    const { id: authorId } = parseInput(params, routeParamsSchema);
    const result = await authorService.deleteAuthor(authorId);
    return apiSuccess(result);
  }
);
