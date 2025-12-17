import { Router } from "express";
import { MatchEventController } from "./macth-event.controller";

const route = Router();

route.post("/create", MatchEventController.addEvent);
route.delete("/:id/delete", MatchEventController.deleteEvent);
route.get("/:id/team", MatchEventController.getEventsByTeam);
route.delete("/:id/match", MatchEventController.getEventsByMatch);

export default route;
