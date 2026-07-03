import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, requiredSlugString, requiredTrimmedString } from "@/lib/api/validation";
import { AuthorRepository } from "@/lib/repositories";
import { AuthorService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const createAuthorSchema = z.object({
  userId: requiredTrimmedString("User ID is required"),
  bio: z.string().optional(),
  slug: requiredSlugString("Slug is required"),
  avatarUrl: z.string().optional(),
  socialLinks: z.record(z.string(), z.string()).optional(),
});

const authorService = new AuthorService(new AuthorRepository());

export const GET = withApiHandler({ scope: "api/admin/authors:get" }, async () => {
  await requirePermission("author.manage");
  const authors = await authorService.listAuthors();
  return apiSuccess(authors);
});

export const POST = withApiHandler({ scope: "api/admin/authors:create" }, async (req) => {
  await requirePermission("author.manage");
  const body = await parseJsonBody(req, createAuthorSchema);
  const author = await authorService.createAuthor(body);
  return apiSuccess(author, { status: 201 });
});
