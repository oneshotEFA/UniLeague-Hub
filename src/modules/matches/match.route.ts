
import { Router } from "express";
import { MatchController } from "./match.controller";

const router = Router();

// GET ALL MATCHES
router.get("/all/:id", MatchController.getMatches);

// CREATE MATCH
router.post("/", MatchController.createMatch);

// UPDATE MATCH SCHEDULE
router.put("/:id/schedule", MatchController.updateMatchSchedule);

// START MATCH
router.put("/:id/start", MatchController.startMatch);

// POSTPONE MATCH
router.put("/:id/postpone", MatchController.postponeMatch);

// END MATCH
router.put("/:id/end", MatchController.endMatch);

// GET MATCH BY ID
router.get("/:id", MatchController.getMatchById);

// GET MATCHES BY TOURNAMENT
router.get("/tournament/:tournamentId", MatchController.getMatchesByTournament);

// GET MATCHES BY TEAM
router.get("/team/:teamId", MatchController.getMatchesByTeam);

// GET TODAY MATCHES
router.get("/today", MatchController.getTodayMatches);

// GET LIVE MATCHES
router.get("/live", MatchController.getLiveMatches);

// GET TODAY MATCHES BY TOURNAMENT
router.get("/today/:tournamentId", MatchController.getTodayMatchesByTournament);

// GET LIVE MATCHES BY TOURNAMENT
router.get("/live/:tournamentId", MatchController.getLiveMatchesByTournament);

export default router;
