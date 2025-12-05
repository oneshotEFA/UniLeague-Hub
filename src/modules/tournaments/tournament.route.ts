import { Router } from "express";
import { TournamentController } from "./tournament.controller";

const router = Router();

router.get("/", TournamentController.getTournaments);

router.get("/:id", TournamentController.getTournament);

export default router;
