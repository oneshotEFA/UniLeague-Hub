import { Router } from "express";
import { CoachController } from "./coach.controller";
const route = Router();
route.post("/request/line-up", CoachController.RequestLineUp);
route.get("/match/line-up/:id/:teamId", CoachController.getLineUpOfMatch);
route.get("/line-up/record/:teamId", CoachController.getLineupHistory);
export default route;
