import { Router } from "express";
import authRouter from "../modules/auth/auth.route";
import tournamentRoute from "../modules/tournaments/tournament.route";
import aiRoute from "../modules/_AI/aiRoute";
import playerRouter from "../modules/players/player.route";
import teamRouter from "../modules/teams/team.route";

const apiRouter = Router();
apiRouter.use("/auth", authRouter);
apiRouter.use("/tournaments", tournamentRoute);
apiRouter.use("/ai", aiRoute); // Placeholder for user routes
apiRouter.use("/player", playerRouter)
apiRouter.use("/team", teamRouter)
export default apiRouter;
