import { Router } from "express";
import authRouter from "../modules/auth/auth.route";

import playerRouter from "../modules/players/player.route";
import teamRouter from "../modules/teams/team.route";
import eventRouter from "../modules/match-events/macth-event.route";
import matchesRouter from "../modules/matches/match.route";
import tournamentRoute from "../modules/tournaments/tournament.route";
import managerRouter from "../modules/admin/manager.route";
import notifcationRouter from "../modules/notifications/notification.route";
import adminRouter from "../modules/admin/admin.route";
import galleryRoute from "../modules/gallery/gallery.route";
import coachRoute from "../modules/coach/coach.router";
const apiRouter = Router();
apiRouter.use("/auth", authRouter);
apiRouter.use("/tournaments", tournamentRoute);

apiRouter.use("/player", playerRouter);
apiRouter.use("/teams", teamRouter);
apiRouter.use("/event", eventRouter);
apiRouter.use("/matches", matchesRouter); // Placeholder for match routes
apiRouter.use("/manager", managerRouter);
apiRouter.use("/notification", notifcationRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/gallery", galleryRoute);
apiRouter.use("/coach", coachRoute);
export default apiRouter;
