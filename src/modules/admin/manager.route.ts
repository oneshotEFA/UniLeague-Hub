import { Router } from "express";
import { ManagerController } from "./manager.controller";
import { upload } from "../../middlewares/multer";
import { PlayerControl } from "../players/player.controller";
import { MatchController } from "../matches/match.controller";

const route = Router();
// Manager routes
route.post(
  "/create/team",
  upload.single("logo"),
  ManagerController.registerTeam
);
route.post(
  "/create/player",
  upload.single("playerPhoto"),
  PlayerControl.createPlayer
);
route.post(
  "/generate/fixture",

  ManagerController.generateFixture
);
route.get("/matches/:id/tournament", MatchController.getMatches);
export default route;
