import { PrismaRepository } from "./base/prisma-repository";
import { Prisma } from "@prisma/client";

export class MediaRepository extends PrismaRepository {
  // Folders
  async createFolder(data: { name: string; parentId?: string | null }) {
    return this.prisma.mediaFolder.create({ data });
  }

  async findFolderById(id: string) {
    return this.prisma.mediaFolder.findUnique({ where: { id } });
  }

  async listFolders(parentId?: string | null) {
    return this.prisma.mediaFolder.findMany({ where: { parentId } });
  }

  // Assets
  async createAsset(data: Prisma.MediaAssetCreateInput) {
    return this.prisma.mediaAsset.create({ data });
  }

  async updateAsset(id: string, data: Prisma.MediaAssetUpdateInput) {
    return this.prisma.mediaAsset.update({ where: { id }, data });
  }

  async findAssetById(id: string, includeDeleted = false) {
    return this.prisma.mediaAsset.findUnique({
      where: includeDeleted
        ? { id }
        : { id, deletedAt: null },
    });
  }

  async listAssets(folderId?: string | null) {
    return this.prisma.mediaAsset.findMany({
      where: {
        folderId: folderId ?? null,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async softDeleteAsset(id: string) {
    return this.prisma.mediaAsset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restoreAsset(id: string) {
    return this.prisma.mediaAsset.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async deletePermanent(id: string) {
    return this.prisma.mediaAsset.delete({ where: { id } });
  }
}
