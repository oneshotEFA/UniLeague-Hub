import { Router } from "express";
import { ManagerController } from "./manager.controller";
import { upload } from "../../middlewares/multer";

const route = Router();
// Manager routes
route.post(
  "/manager/create/team",
  upload.single("logo"),
  ManagerController.registerTeam
);

export default route;
