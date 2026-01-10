"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryService = void 0;
const sharp_1 = __importDefault(require("sharp"));
const cloudinary_config_1 = __importDefault(require("../../config/cloudinary.config"));
const db_config_1 = require("../../config/db.config");
class GalleryService {
    constructor(prismaService = db_config_1.prisma) {
        this.prismaService = prismaService;
    }
    async savePicture(rawImage, ownerId, ownerType, usage, isPrimary = false) {
        try {
            const compressedImage = await this.compressImage(rawImage);
            const { url, publicId } = await this.upload(compressedImage, `${ownerType}`);
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
        }
        catch (error) {
            console.error("GalleryService.savePicture error:", error);
            return { ok: false, error: "Unknown error occurred" };
        }
    }
    async getImagesByType(ownerType, usage, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const where = { ownerType };
            if (usage)
                where.usage = usage;
            const images = await this.prismaService.mediaGallery.findMany({
                where,
                skip,
                take: limit,
                select: { url: true, publicId: true },
                orderBy: { createdAt: "desc" },
            });
            return images;
        }
        catch (error) {
            console.error("GalleryService.getImagesByType error:", error);
            throw error;
        }
    }
    async getImagesByOwner(ownerType, ownerId, usage, // optional filter like COVER, GALLERY, AVATAR
    page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const where = { ownerType, ownerId };
        if (usage)
            where.usage = usage;
        return this.prismaService.mediaGallery.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: { url: true, isPrimary: true, usage: true },
        });
    }
    async deleteImage(publicId) {
        try {
            await cloudinary_config_1.default.uploader.destroy(publicId);
            await this.prismaService.mediaGallery.deleteMany({ where: { publicId } });
            return { ok: true };
        }
        catch (error) {
            console.error("GalleryService.deleteImage error:", error);
            return { ok: false, error: "Failed to delete image" };
        }
    }
    async getGalleryOwnerId(id) {
        try {
            const res = await this.prismaService.mediaGallery.findMany({
                where: { ownerId: id, NOT: { usage: "LOGO" } },
                select: { id: true, url: true, isPrimary: true, usage: true },
            });
            if (!res) {
                return {
                    ok: false,
                    message: "Service Not Available",
                    data: [],
                };
            }
            if (res.length === 0) {
                return {
                    ok: false,
                    message: "No Gallery Found at this owner",
                    data: [],
                };
            }
            return {
                ok: true,
                message: "Gallery Fetched",
                data: res,
            };
        }
        catch (error) {
            return {
                ok: false,
                message: "Smtg crash at the moment",
                data: [],
            };
        }
    }
    async upload(buffer, folderName) {
        return new Promise((resolve, reject) => {
            cloudinary_config_1.default.uploader
                .upload_stream({
                folder: folderName,
            }, (error, result) => {
                if (error)
                    return reject(error);
                if (result) {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                    });
                }
                else {
                    reject(new Error("Upload failed without a result."));
                }
            })
                .end(buffer);
        });
    }
    compressImage(buffer) {
        return new Promise((resolve, reject) => {
            (0, sharp_1.default)(buffer)
                .resize(720)
                .jpeg({ quality: 80 })
                .toBuffer()
                .then((compressedBuffer) => resolve(compressedBuffer))
                .catch((error) => reject(error));
        });
    }
}
exports.GalleryService = GalleryService;
