import { Router } from "express";
import { GalleryController } from "./gallery.controller";
const route = Router();
route.get("/get/:ownerId", GalleryController.getImageByOwner);
export default route;
