import { PrismaRepository } from "./base/prisma-repository";

export class GalleryRepository extends PrismaRepository {
  async createGallery(data: { title: string; description?: string | null; featuredImage?: string | null }) {
    return this.prisma.photoGallery.create({ data });
  }

  async findGalleryById(id: string) {
    return this.prisma.photoGallery.findUnique({ where: { id } });
  }

  async listGalleries() {
    return this.prisma.photoGallery.findMany();
  }

  async updateGallery(
    id: string,
    data: { title?: string; description?: string | null; featuredImage?: string | null }
  ) {
    return this.prisma.photoGallery.update({ where: { id }, data });
  }

  async deleteGallery(id: string) {
    return this.prisma.photoGallery.delete({ where: { id } });
  }

  // Gallery Items
  async createItem(data: { galleryId: string; mediaAssetId: string; order?: number }) {
    return this.prisma.galleryItem.create({ data });
  }

  async listItems(galleryId: string) {
    return this.prisma.galleryItem.findMany({
      where: { galleryId },
      orderBy: { order: "asc" },
    });
  }

  async deleteItem(id: string) {
    return this.prisma.galleryItem.delete({ where: { id } });
  }
}
