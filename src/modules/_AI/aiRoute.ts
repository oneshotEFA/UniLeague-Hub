import { Router } from "express";

import { AIController } from "./aicontroller";

const router = Router();

router.post("/generate-fixtures", AIController.getTournamentTeams);
router.post("/generate-group", AIController.getGroupStageTeam);
router.post("/generate-knockout", AIController.getKnockOutTeam);
router.post("/generate-poster", AIController.generatePoster);

export default router;
