import { Router } from "express";
import { teamControl } from "./team.controller";
import { upload } from "../../middlewares/multer";

const teamRouter = Router();

teamRouter.post("/createTeam", upload.single("logo"), teamControl.createTeam);
teamRouter.get("/", teamControl.getTeams);
teamRouter.get("/:id", teamControl.getTeamById);
teamRouter.put("/:id", upload.single("logo"), teamControl.updateTeam);
teamRouter.delete("/:id", teamControl.removeTeam);
teamRouter.get("/search/:name", teamControl.searchTeam);
teamRouter.get("/status/:id", teamControl.teamStatus);

export default teamRouter;
