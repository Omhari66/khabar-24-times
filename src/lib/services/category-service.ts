import { ConflictError, NotFoundError } from "@/lib/errors";
import { CategoryRepository } from "@/lib/repositories";
import { ApplicationService } from "@/lib/services/base/application-service";
import { AuditRepository } from "@/lib/repositories/audit-repository";
import { AuditService } from "@/lib/services/audit-service";

type CategoryRepositoryLike = Pick<
  CategoryRepository,
  | "findAllWithArticleCounts"
  | "findBySlug"
  | "findById"
  | "create"
  | "update"
  | "countArticles"
  | "delete"
>;

export class CategoryService extends ApplicationService {
  private readonly auditService = new AuditService(new AuditRepository());

  constructor(private readonly categoryRepository: CategoryRepositoryLike) {
    super("service/category");
  }

  listCategories() {
    return this.categoryRepository.findAllWithArticleCounts();
  }

  async createCategory(input: {
    name: string;
    slug: string;
    order?: number;
    navVisible?: boolean;
    homeVisible?: boolean;
    icon?: string;
    color?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    description?: string;
    parentId?: string;
  }) {
    const existingCategory = await this.categoryRepository.findBySlug(input.slug);

    if (existingCategory) {
      throw new ConflictError("A category with this slug already exists");
    }

    if (input.parentId) {
      const parent = await this.categoryRepository.findById(input.parentId);
      if (!parent) {
        throw new NotFoundError("Parent category not found");
      }
    }

    const category = await this.categoryRepository.create(input);

    await this.auditService.log({
      action: "CATEGORY_CREATE",
      entityType: "Category",
      entityId: category.id,
      newValue: category,
      status: "SUCCESS",
    });

    return category;
  }

  async updateCategory(
    categoryId: string,
    input: {
      name?: string;
      slug?: string;
      order?: number;
      navVisible?: boolean;
      homeVisible?: boolean;
      icon?: string;
      color?: string;
      seoTitle?: string;
      seoDescription?: string;
      seoKeywords?: string;
      description?: string;
      parentId?: string | null;
    }
  ) {
    const existingCategory = await this.categoryRepository.findById(categoryId);

    if (!existingCategory) {
      throw new NotFoundError("Category not found");
    }

    if (input.parentId) {
      if (input.parentId === categoryId) {
        throw new ConflictError("A category cannot be its own parent");
      }
      const parent = await this.categoryRepository.findById(input.parentId);
      if (!parent) {
        throw new NotFoundError("Parent category not found");
      }
    }

    if (input.slug && input.slug !== existingCategory.slug) {
      const slugCollision = await this.categoryRepository.findBySlug(input.slug);
      if (slugCollision) {
        throw new ConflictError("A category with this slug already exists");
      }
    }

    const updated = await this.categoryRepository.update(categoryId, input);

    await this.auditService.log({
      action: "CATEGORY_UPDATE",
      entityType: "Category",
      entityId: updated.id,
      previousValue: existingCategory,
      newValue: updated,
      status: "SUCCESS",
    });

    return updated;
  }

  async deleteCategory(categoryId: string) {
    const existingCategory = await this.categoryRepository.findById(categoryId);

    if (!existingCategory) {
      throw new NotFoundError("Category not found");
    }

    const articleCount = await this.categoryRepository.countArticles(categoryId);
    if (articleCount > 0) {
      throw new ConflictError("Cannot delete a category with existing articles.");
    }

    await this.categoryRepository.delete(categoryId);

    await this.auditService.log({
      action: "CATEGORY_DELETE",
      entityType: "Category",
      entityId: existingCategory.id,
      previousValue: { name: existingCategory.name, slug: existingCategory.slug },
      status: "SUCCESS",
    });

    return { success: true as const };
  }
}
