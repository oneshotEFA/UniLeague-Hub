import { Router } from "express";
import { CoachController } from "./coach.controller";
const route = Router();
route.post("/request/line-up", CoachController.RequestLineUp);
route.get("/match/line-up/:id/:teamId", CoachController.getLineUpOfMatch);
route.get("/match/line-up/history/:teamId", CoachController.getLineupHistory);
export default route;
