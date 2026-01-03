import { Request, Response } from "express";
import { GalleryService } from "./gallery.service";
import { ApiResponseBuilder } from "../../common/utils/ApiResponse";

const gallery = new GalleryService();
export class GalleryController {
  static async getImageByOwner(req: Request, res: Response) {
    const { ownerId } = req.params;
    const data = await gallery.getGalleryOwnerId(ownerId);
    if (!data) {
      return new ApiResponseBuilder()
        .internalError("Service Not Available")
        .build(res);
    }
    if (!data.ok) {
      return new ApiResponseBuilder().badRequest(data.message).build(res);
    }
    return new ApiResponseBuilder()
      .ok(data.message)
      .withData(data.data)
      .build(res);
  }
}
