import { Router } from "express";
import authRouter from "../modules/auth/auth.route";
import tournamentRoute from "../modules/tournaments/tournament.route";
import aiRoute from "../modules/_AI/aiRoute";

const apiRouter = Router();
apiRouter.use("/auth", authRouter);
apiRouter.use("/tournaments", tournamentRoute);
apiRouter.use("/ai", aiRoute); // Placeholder for user routes
export default apiRouter;
