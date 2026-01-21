import { Router } from "express";
import { MatchController } from "./match.controller";

const router = Router();

// GET ALL MATCHES
router.get("/all/:id", MatchController.getMatches);



// UPDATE MATCH SCHEDULE
router.put("/:id/schedule", MatchController.updateMatchSchedule);

// START MATCH
router.put("/:id/start", MatchController.startMatch);

// POSTPONE MATCH
router.put("/:id/postpone", MatchController.postponeMatch);



// GET MATCH BY ID
router.get("/:id", MatchController.getMatchById);

// GET MATCHES BY TOURNAMENT
router.get("/tournament/:tournamentId", MatchController.getMatchesByTournament);

// GET MATCHES BY TEAM
router.get("/team/:teamId", MatchController.getMatchesByTeam);

// GET TODAY MATCHES
router.get("/today/all", MatchController.getTodayMatches);

// GET LIVE MATCHES
router.get("/live/all", MatchController.getLiveMatches);

// GET TODAY MATCHES BY TOURNAMENT
router.get("/today/:tournamentId", MatchController.getTodayMatchesByTournament);

// GET LIVE MATCHES BY TOURNAMENT
router.get(
  "/live/:tournamentId/tournament",
  MatchController.getLiveMatchesByTournament
);

//recent
router.get("/recent/:id/tournament", MatchController.recentMatchTournament);
router.get("/recent/:id/team", MatchController.recentMatchTeam);
router.get("/recent/all", MatchController.recentMatchAll);

//next week macthes
router.get("/up-coming/:id/tournament", MatchController.nextMatchTournament);
router.get("/up-coming/:id/team", MatchController.nextMatchTeam);
router.get("/up-coming/all", MatchController.nextMatchAll);

export default router;
