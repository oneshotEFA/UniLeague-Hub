"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const match_controller_1 = require("./match.controller");
const router = (0, express_1.Router)();
// GET ALL MATCHES
router.get("/all/:id", match_controller_1.MatchController.getMatches);
// CREATE MATCH
router.post("/", match_controller_1.MatchController.createMatch);
// UPDATE MATCH SCHEDULE
router.put("/:id/schedule", match_controller_1.MatchController.updateMatchSchedule);
// START MATCH
router.put("/:id/start", match_controller_1.MatchController.startMatch);
// POSTPONE MATCH
router.put("/:id/postpone", match_controller_1.MatchController.postponeMatch);
// END MATCH
router.put("/:id/end", match_controller_1.MatchController.endMatch);
// GET MATCH BY ID
router.get("/:id", match_controller_1.MatchController.getMatchById);
// GET MATCHES BY TOURNAMENT
router.get("/tournament/:tournamentId", match_controller_1.MatchController.getMatchesByTournament);
// GET MATCHES BY TEAM
router.get("/team/:teamId", match_controller_1.MatchController.getMatchesByTeam);
// GET TODAY MATCHES
router.get("/today/all", match_controller_1.MatchController.getTodayMatches);
// GET LIVE MATCHES
router.get("/live/all", match_controller_1.MatchController.getLiveMatches);
// GET TODAY MATCHES BY TOURNAMENT
router.get("/today/:tournamentId", match_controller_1.MatchController.getTodayMatchesByTournament);
// GET LIVE MATCHES BY TOURNAMENT
router.get("/live/:tournamentId/tournament", match_controller_1.MatchController.getLiveMatchesByTournament);
//recent
router.get("/recent/:id/tournament", match_controller_1.MatchController.recentMatchTournament);
router.get("/recent/:id/team", match_controller_1.MatchController.recentMatchTeam);
router.get("/recent/all", match_controller_1.MatchController.recentMatchAll);
//next week macthes
router.get("/up-coming/:id/tournament", match_controller_1.MatchController.nextMatchTournament);
router.get("/up-coming/:id/team", match_controller_1.MatchController.nextMatchTeam);
router.get("/up-coming/all", match_controller_1.MatchController.nextMatchAll);
exports.default = router;
