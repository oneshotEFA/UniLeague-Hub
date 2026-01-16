"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryController = void 0;
const gallery_service_1 = require("./gallery.service");
const ApiResponse_1 = require("../../common/utils/ApiResponse");
const gallery = new gallery_service_1.GalleryService();
class GalleryController {
    static async getImageByOwner(req, res) {
        const { ownerId } = req.params;
        const data = await gallery.getGalleryOwnerId(ownerId);
        if (!data) {
            return new ApiResponse_1.ApiResponseBuilder()
                .internalError("Service Not Available")
                .build(res);
        }
        if (!data.ok) {
            return new ApiResponse_1.ApiResponseBuilder().badRequest(data.message).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok(data.message)
            .withData(data.data)
            .build(res);
    }
}
exports.GalleryController = GalleryController;
