import { ApplicationService } from "./base/application-service";
import { TagRepository } from "@/lib/repositories/tag-repository";
import { ConflictError, NotFoundError } from "@/lib/errors";

export class TagService extends ApplicationService {
  constructor(private readonly tagRepository: TagRepository) {
    super("service/tag");
  }

  async listTags() {
    return this.tagRepository.findAll();
  }

  async getTag(id: string) {
    const tag = await this.tagRepository.findById(id);
    if (!tag) {
      throw new NotFoundError("Tag not found");
    }
    return tag;
  }

  async createTag(input: { name: string; slug: string }) {
    const existing = await this.tagRepository.findBySlug(input.slug);
    if (existing) {
      throw new ConflictError("A tag with this slug already exists");
    }
    return this.tagRepository.create(input);
  }

  async updateTag(id: string, input: { name?: string; slug?: string }) {
    const tag = await this.tagRepository.findById(id);
    if (!tag) {
      throw new NotFoundError("Tag not found");
    }

    if (input.slug && input.slug !== tag.slug) {
      const existing = await this.tagRepository.findBySlug(input.slug);
      if (existing) {
        throw new ConflictError("A tag with this slug already exists");
      }
    }

    return this.tagRepository.update(id, input);
  }

  async deleteTag(id: string) {
    const tag = await this.tagRepository.findById(id);
    if (!tag) {
      throw new NotFoundError("Tag not found");
    }
    return this.tagRepository.delete(id);
  }

  async mergeTags(sourceTagId: string, targetTagId: string) {
    const source = await this.tagRepository.findById(sourceTagId);
    if (!source) {
      throw new NotFoundError("Source tag not found");
    }

    const target = await this.tagRepository.findById(targetTagId);
    if (!target) {
      throw new NotFoundError("Target tag not found");
    }

    await this.tagRepository.mergeTags(sourceTagId, targetTagId);
    return { success: true as const };
  }
}
