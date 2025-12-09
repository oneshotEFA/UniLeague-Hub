import { Router } from "express";
import { PlayerControl } from "./player.controller";

const playerRouter = Router()


playerRouter.post("/createPlayer", PlayerControl.createPlayer)
playerRouter.get("/Players", PlayerControl.getPlayers)
playerRouter.get("/search", PlayerControl.getPlayerByName)
playerRouter.get("/id", PlayerControl.getPlayerById)



export default playerRouter