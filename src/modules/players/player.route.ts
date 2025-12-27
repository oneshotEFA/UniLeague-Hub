import { Router } from "express";
import { PlayerControl } from "./player.controller";
import { upload } from "../../middlewares/multer";
const playerRouter = Router();

playerRouter.post(
  "/create",
  upload.single("playerPhoto"),
  PlayerControl.createPlayer
);
playerRouter.get("/:teamId/team", PlayerControl.getPlayers);
playerRouter.get("/search/:name", PlayerControl.getPlayerByName);
playerRouter.get("/:id/player", PlayerControl.getPlayerById);
playerRouter.post("/transfer", PlayerControl.transferPlayer);

export default playerRouter;
