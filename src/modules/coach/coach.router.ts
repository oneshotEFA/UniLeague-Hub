import { Router } from "express";
import { CoachController } from "./coach.controller";
import { reqAuth } from "../../middlewares/reqAuth";
import { requireAdmin } from "../../middlewares/reqPermission";
const route = Router();
route.post(
  "/request/line-up",
  reqAuth,
  requireAdmin(["coach"]),
  CoachController.RequestLineUp,
);
route.get(
  "/match/line-up/:id/:teamId",
  reqAuth,
  requireAdmin(["coach"]),
  CoachController.getLineUpOfMatch,
);
route.get(
  "/line-up/record/:teamId",
  reqAuth,
  requireAdmin(["coach"]),
  CoachController.getLineupHistory,
);
export default route;
