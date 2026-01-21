import { Router } from "express";
import { MatchEventController } from "./macth-event.controller";

const route = Router();
route.get("/:id/team", MatchEventController.getEventsByTeam);
route.get("/:id/match", MatchEventController.getEventsByMatch);

export default route;
