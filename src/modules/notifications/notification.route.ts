import { NotificationController } from "./notifcation.controller";
import { Router } from "express";

const notficationRouter = Router();
notficationRouter.get(
  "/:id/admin",
  NotificationController.getAdminNotification
);
notficationRouter.get(
  "/broadcast/:page",
  NotificationController.getBroadCastNotification
);
notficationRouter.get(
  "/:id/tournament",
  NotificationController.getTournamentBroadCast
);

export default notficationRouter;
