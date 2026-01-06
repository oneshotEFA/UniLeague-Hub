import { Router } from "express";
import { ManagerController } from "./manager.controller";
import { upload } from "../../middlewares/multer";
import { PlayerControl } from "../players/player.controller";
import { MatchController } from "../matches/match.controller";
import { MatchEventController } from "../match-events/macth-event.controller";
import { teamControl } from "../teams/team.controller";
import { reqAuth } from "../../middlewares/reqAuth";
import { requireAdmin } from "../../middlewares/reqPermission";

const route = Router();
// teams
route.post(
  "/team/create",
  upload.single("logo"),
  reqAuth,
  requireAdmin(["tournamentManager"]),
  ManagerController.registerTeam
);
route.delete(
  "/team/delete/:id",
  reqAuth,
  requireAdmin(["tournamentManager"]),
  teamControl.removeTeam
);

//matches
route.post(
  "/matches/create",
  reqAuth,
  requireAdmin(["tournamentManager"]),
  MatchController.createMatches
); // multiple creation
route.post(
  "/match/create",
  reqAuth,
  requireAdmin(["tournamentManager"]),
  MatchController.createMatch
); // single creation
route.post(
  "/generate/fixture",
  reqAuth,
  requireAdmin(["tournamentManager"]),
  ManagerController.generateFixture
);
route.get(
  "/matches/:id/tournament",
  reqAuth,
  requireAdmin(["tournamentManager"]),
  MatchController.getMatches
);
route.post(
  "/match/event/create",
  reqAuth,
  requireAdmin(["tournamentManager"]),
  MatchEventController.addEvent
);
route.put(
  "/match/:id/start",
  reqAuth,
  requireAdmin(["tournamentManager"]),
  MatchController.startMatch
);
route.put(
  "/match/:id/end",
  reqAuth,
  requireAdmin(["tournamentManager"]),
  MatchController.endMatch
);

//players
route.post(
  "/player/transfer",
  reqAuth,
  requireAdmin(["tournamentManager"]),
  PlayerControl.transferPlayer
);
route.delete(
  "/player/delete/:id",
  reqAuth,
  requireAdmin(["tournamentManager"]),
  PlayerControl.deletePlayer
);
route.post(
  "/player/create",
  reqAuth,
  requireAdmin(["tournamentManager"]),
  upload.single("playerPhoto"),
  PlayerControl.createPlayer
);

//gallery
route.get(
  "/gallery/:id/tournament",
  reqAuth,
  requireAdmin(["tournamentManager"]),
  ManagerController.getGalleryOfTournament
);
route.post(
  "/gallery/post",
  reqAuth,
  requireAdmin(["tournamentManager"]),
  upload.single("banner"),
  ManagerController.postToGallery
);

//news
route.post(
  "/news/create",
  reqAuth,
  requireAdmin(["tournamentManager"]),
  upload.single("banner"),
  ManagerController.postNewsToTournament
);
route.post(
  "/news/create",
  reqAuth,
  requireAdmin(["tournamentManager"]),
  upload.single("banner"),
  ManagerController.postNewsToTournament
);
route.delete(
  "/news/delete/:id",
  reqAuth,
  requireAdmin(["tournamentManager"]),
  ManagerController.deleteNews
);
route.post(
  "/message/send",
  reqAuth,
  requireAdmin(["tournamentManager"]),
  ManagerController.directMessage
);
route.get(
  "/message/read/:id",
  reqAuth,
  requireAdmin(["tournamentManager"]),
  ManagerController.getDirectMessages
);
export default route;
