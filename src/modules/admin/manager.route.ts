import { Router } from "express";
import { ManagerController } from "./manager.controller";
import { upload } from "../../middlewares/multer";
import { PlayerControl } from "../players/player.controller";
import { MatchController } from "../matches/match.controller";
import { MatchEventController } from "../match-events/macth-event.controller";
import { teamControl } from "../teams/team.controller";

const route = Router();
// teams
route.post(
  "/team/create",
  upload.single("logo"),
  ManagerController.registerTeam
);
route.delete("/team/delete/:id", teamControl.removeTeam);

//matches
route.post("/matches/create", MatchController.createMatches); // multiple creation
route.post("/match/create", MatchController.createMatch); // single creation
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

//gallery
route.get("/gallery/:id/tournament", ManagerController.getGalleryOfTournament);
route.post(
  "/gallery/post",
  upload.single("banner"),
  ManagerController.postToGallery
);

//news
route.post(
  "/news/create",
  upload.single("banner"),
  ManagerController.postNewsToTournament
);
route.post("/message/send", ManagerController.directMessage);
route.get("/message/read/:id", ManagerController.getDirectMessages);
export default route;
