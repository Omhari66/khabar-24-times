import { ApplicationService } from "./base/application-service";
import { MediaRepository } from "@/lib/repositories/media-repository";
import { NotFoundError } from "@/lib/errors";
import { Prisma } from "@prisma/client";

export class MediaService extends ApplicationService {
  constructor(private readonly mediaRepository: MediaRepository) {
    super("service/media");
  }

  // Folders
  async createFolder(name: string, parentId?: string | null) {
    return this.mediaRepository.createFolder({ name, parentId });
  }

  async listFolders(parentId?: string | null) {
    return this.mediaRepository.listFolders(parentId);
  }

  // Assets
  async createAsset(input: {
    filename: string;
    mimeType: string;
    fileSize: number;
    url: string;
    variants?: Prisma.InputJsonValue;
    altText?: string;
    caption?: string;
    copyright?: string;
    photographer?: string;
    folderId?: string;
  }) {
    return this.mediaRepository.createAsset(input);
  }

  async getAsset(id: string) {
    const asset = await this.mediaRepository.findAssetById(id);
    if (!asset) {
      throw new NotFoundError("Media asset not found");
    }
    return asset;
  }

  async updateAsset(
    id: string,
    input: {
      altText?: string;
      caption?: string;
      copyright?: string;
      photographer?: string;
      folderId?: string | null;
    }
  ) {
    await this.getAsset(id);
    return this.mediaRepository.updateAsset(id, input);
  }

  async listAssets(folderId?: string | null) {
    return this.mediaRepository.listAssets(folderId);
  }

  async softDeleteAsset(id: string) {
    await this.getAsset(id);
    return this.mediaRepository.softDeleteAsset(id);
  }

  async restoreAsset(id: string) {
    const asset = await this.mediaRepository.findAssetById(id, true);
    if (!asset) {
      throw new NotFoundError("Media asset not found");
    }
    return this.mediaRepository.restoreAsset(id);
  }
}
