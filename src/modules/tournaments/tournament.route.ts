import { Router } from "express";
import { TournamentController } from "./tournament.controller";

const router = Router();

router.get("/", TournamentController.getTournaments);

router.get("/:id", TournamentController.getTournament);

router.get("/:tournamentId/teams", TournamentController.getTournamentTeams);

router.get(
  "/:tournamentId/matches",
  TournamentController.getTournamentFixtures
);

router.get(
  "/:tournamentId/standings",
  TournamentController.getTournamentStandings
);

export default router;
