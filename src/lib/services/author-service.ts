import { ApplicationService } from "./base/application-service";
import { AuthorRepository } from "@/lib/repositories/author-repository";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { Prisma } from "@prisma/client";

export class AuthorService extends ApplicationService {
  constructor(private readonly authorRepository: AuthorRepository) {
    super("service/author");
  }

  async listAuthors() {
    return this.authorRepository.findAll();
  }

  async getAuthor(id: string) {
    const author = await this.authorRepository.findById(id);
    if (!author) {
      throw new NotFoundError("Author not found");
    }
    return author;
  }

  async getAuthorBySlug(slug: string) {
    const author = await this.authorRepository.findBySlug(slug);
    if (!author) {
      throw new NotFoundError("Author not found");
    }
    return author;
  }

  async createAuthor(input: {
    userId: string;
    bio?: string;
    slug: string;
    avatarUrl?: string;
    socialLinks?: Prisma.InputJsonValue;
  }) {
    const existingSlug = await this.authorRepository.findBySlug(input.slug);
    if (existingSlug) {
      throw new ConflictError("An author with this slug already exists");
    }

    const existingUser = await this.authorRepository.findByUserId(input.userId);
    if (existingUser) {
      throw new ConflictError("An author profile already exists for this user");
    }

    return this.authorRepository.create(input);
  }

  async updateAuthor(
    id: string,
    input: {
      bio?: string;
      slug?: string;
      avatarUrl?: string;
      socialLinks?: Prisma.InputJsonValue;
    }
  ) {
    const author = await this.authorRepository.findById(id);
    if (!author) {
      throw new NotFoundError("Author not found");
    }

    if (input.slug && input.slug !== author.slug) {
      const existingSlug = await this.authorRepository.findBySlug(input.slug);
      if (existingSlug) {
        throw new ConflictError("An author with this slug already exists");
      }
    }

    return this.authorRepository.update(id, input);
  }

  async deleteAuthor(id: string) {
    const author = await this.authorRepository.findById(id);
    if (!author) {
      throw new NotFoundError("Author not found");
    }
    return this.authorRepository.delete(id);
  }
}
