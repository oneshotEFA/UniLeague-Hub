import sharp from "sharp";
import { ImageUsage, MediaOwnerType } from "../../../generated/prisma";
import cloudinary from "../../config/cloudinary.config";
import { prisma } from "../../config/db";

export class GalleryService {
  constructor(private prismaService = prisma) {}
  async savePicture(
    rawImage: Buffer,
    ownerId: string,
    ownerType: MediaOwnerType,
    usage: ImageUsage,
    isPrimary = false
  ) {
    try {
      const compressedImage = await this.compressImage(rawImage);
      const { url, publicId } = await this.upload(
        compressedImage,
        `${ownerType}`
      );

      if (!url) {
        return { ok: false, error: "Image upload failed" };
      }

      if (isPrimary) {
        await this.prismaService.mediaGallery.updateMany({
          where: { ownerId, ownerType, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      const saved = await this.prismaService.mediaGallery.create({
        data: { ownerId, ownerType, usage, url, isPrimary, publicId },
      });

      return { ok: true, data: saved };
    } catch (error) {
      console.error("GalleryService.savePicture error:", error);
      return { ok: false, error: "Unknown error occurred" };
    }
  }

  async getImagesByType(
    ownerType: MediaOwnerType,
    usage?: ImageUsage,
    page = 1,
    limit = 10
  ) {
    try {
      const skip = (page - 1) * limit;
      const where: any = { ownerType };
      if (usage) where.usage = usage;

      const images = await this.prismaService.mediaGallery.findMany({
        where,
        skip,
        take: limit,
        select: { url: true, publicId: true },
        orderBy: { createdAt: "desc" },
      });

      return images;
    } catch (error) {
      console.error("GalleryService.getImagesByType error:", error);
      throw error;
    }
  }
  async getImagesByOwner(
    ownerType: MediaOwnerType,
    ownerId: string,
    usage?: ImageUsage, // optional filter like COVER, GALLERY, AVATAR
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;

    const where: any = { ownerType, ownerId };
    if (usage) where.usage = usage;

    return this.prismaService.mediaGallery.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { url: true, isPrimary: true, usage: true },
    });
  }
  async deleteImage(publicId: string) {
    try {
      await cloudinary.uploader.destroy(publicId);
      await this.prismaService.mediaGallery.deleteMany({ where: { publicId } });
      return { ok: true };
    } catch (error) {
      console.error("GalleryService.deleteImage error:", error);
      return { ok: false, error: "Failed to delete image" };
    }
  }

  private async upload(
    buffer: Buffer,
    folderName: string
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: folderName,
          },
          (error, result) => {
            if (error) return reject(error);
            if (result) {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
              });
            } else {
              reject(new Error("Upload failed without a result."));
            }
          }
        )
        .end(buffer);
    });
  }
  private compressImage(buffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      sharp(buffer)
        .resize(720)
        .jpeg({ quality: 80 })
        .toBuffer()
        .then((compressedBuffer) => resolve(compressedBuffer))
        .catch((error) => reject(error));
    });
  }
}
