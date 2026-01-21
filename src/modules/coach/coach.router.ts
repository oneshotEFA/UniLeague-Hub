import { Router } from "express";
import { CoachController } from "./coach.controller";
import { reqAuth } from "../../middlewares/reqAuth";
import { requireAdmin } from "../../middlewares/reqPermission";
const route = Router();
route.post(
  "/request/line-up",
  reqAuth,

  CoachController.RequestLineUp,
);
route.get(
  "/match/line-up/:id/:teamId",
  CoachController.getLineUpOfMatch,
);
route.get(
  "/line-up/record/:teamId",
  reqAuth,

  CoachController.getLineupHistory,
);
export default route;
