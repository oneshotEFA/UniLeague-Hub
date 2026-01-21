import { Router } from "express";
import { teamControl } from "./team.controller";
import { upload } from "../../middlewares/multer";

const teamRouter = Router();


teamRouter.get("/", teamControl.getTeams);
teamRouter.get("/:id", teamControl.getTeamById);

teamRouter.delete("/:id", teamControl.removeTeam);
teamRouter.get("/search/:name", teamControl.searchTeam);
teamRouter.get("/status/:id", teamControl.teamStatus);

export default teamRouter;
