import { Router } from "express";
import { CoachController } from "./coach.controller";
const route = Router();
route.post("/request/line-up", CoachController.RequestLineUp);
export default route;
