import { Router } from "express";
import { teamControl } from "./team.controller";
import { upload } from "../../middlewares/multer";


const teamRouter = Router();

teamRouter.post("/createTeam", upload.single("logo"), teamControl.createTeam)

export default teamRouter;
