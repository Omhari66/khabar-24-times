import { ApplicationService } from "./base/application-service";
import { GalleryRepository } from "@/lib/repositories/gallery-repository";
import { NotFoundError } from "@/lib/errors";

export class GalleryService extends ApplicationService {
  constructor(private readonly galleryRepository: GalleryRepository) {
    super("service/gallery");
  }

  async createGallery(input: { title: string; description?: string; featuredImage?: string }) {
    return this.galleryRepository.createGallery(input);
  }

  async getGallery(id: string) {
    const gallery = await this.galleryRepository.findGalleryById(id);
    if (!gallery) {
      throw new NotFoundError("Gallery not found");
    }
    return gallery;
  }

  async listGalleries() {
    return this.galleryRepository.listGalleries();
  }

  async updateGallery(id: string, input: { title?: string; description?: string; featuredImage?: string }) {
    await this.getGallery(id);
    return this.galleryRepository.updateGallery(id, input);
  }

  async deleteGallery(id: string) {
    await this.getGallery(id);
    return this.galleryRepository.deleteGallery(id);
  }

  // Items
  async addItemToGallery(galleryId: string, mediaAssetId: string, order?: number) {
    await this.getGallery(galleryId);
    return this.galleryRepository.createItem({ galleryId, mediaAssetId, order });
  }

  async getGalleryItems(galleryId: string) {
    await this.getGallery(galleryId);
    return this.galleryRepository.listItems(galleryId);
  }

  async removeItemFromGallery(itemId: string) {
    return this.galleryRepository.deleteItem(itemId);
  }
}
