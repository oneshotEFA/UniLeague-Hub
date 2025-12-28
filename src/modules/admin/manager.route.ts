import { Router } from "express";
import { ManagerController } from "./manager.controller";
import { upload } from "../../middlewares/multer";
import { PlayerControl } from "../players/player.controller";
import { MatchController } from "../matches/match.controller";
import { MatchEventController } from "../match-events/macth-event.controller";

const route = Router();
// teams
route.post(
  "/team/create",
  upload.single("logo"),
  ManagerController.registerTeam
);

//matches
route.post("/generate/fixture", ManagerController.generateFixture);
route.get("/matches/:id/tournament", MatchController.getMatches);
route.post("/match/event/create", MatchEventController.addEvent);
route.put("/match/:id/start", MatchController.startMatch);
route.put("/match/:id/end", MatchController.endMatch);

//players
route.post("/player/transfer", PlayerControl.transferPlayer);
route.delete("/player/delete/:id", PlayerControl.deletePlayer);
route.post(
  "/player/create",
  upload.single("playerPhoto"),
  PlayerControl.createPlayer
);
export default route;
