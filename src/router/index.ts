import { Router } from "express";
import authRouter from "../modules/auth/auth.route";
import tournamentRoute from "../modules/tournaments/tournament.route";

const apiRouter = Router();
apiRouter.use("/auth", authRouter);
apiRouter.use("/tournaments", tournamentRoute);
export default apiRouter;
