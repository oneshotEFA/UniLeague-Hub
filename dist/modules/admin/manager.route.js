"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const manager_controller_1 = require("./manager.controller");
const multer_1 = require("../../middlewares/multer");
const player_controller_1 = require("../players/player.controller");
const match_controller_1 = require("../matches/match.controller");
const macth_event_controller_1 = require("../match-events/macth-event.controller");
const team_controller_1 = require("../teams/team.controller");
const route = (0, express_1.Router)();
// teams
route.post("/team/create", multer_1.upload.single("logo"), manager_controller_1.ManagerController.registerTeam);
route.delete("/team/delete/:id", team_controller_1.teamControl.removeTeam);
//matches
route.post("/matches/create", match_controller_1.MatchController.createMatches); // multiple creation
route.post("/match/create", match_controller_1.MatchController.createMatch); // single creation
route.post("/generate/fixture", manager_controller_1.ManagerController.generateFixture);
route.get("/matches/:id/tournament", match_controller_1.MatchController.getMatches);
route.post("/match/event/create", macth_event_controller_1.MatchEventController.addEvent);
route.delete("/match/event/:id/delete", macth_event_controller_1.MatchEventController.deleteEvent);
route.put("/match/:id/start", match_controller_1.MatchController.startMatch);
route.put("/match/:id/end", match_controller_1.MatchController.endMatch);
//players
route.post("/player/transfer", player_controller_1.PlayerControl.transferPlayer);
route.delete("/player/delete/:id", player_controller_1.PlayerControl.deletePlayer);
route.post("/player/create", multer_1.upload.single("playerPhoto"), player_controller_1.PlayerControl.createPlayer);
//gallery
route.get("/gallery/:id/tournament", manager_controller_1.ManagerController.getGalleryOfTournament);
route.post("/gallery/post", multer_1.upload.single("banner"), manager_controller_1.ManagerController.postToGallery);
//news
route.post("/news/create", multer_1.upload.single("banner"), manager_controller_1.ManagerController.postNewsToTournament);
route.post("/news/create", multer_1.upload.single("banner"), manager_controller_1.ManagerController.postNewsToTournament);
route.delete("/news/delete/:id", manager_controller_1.ManagerController.deleteNews);
route.post("/message/send", manager_controller_1.ManagerController.directMessage);
route.get("/message/read/:id", manager_controller_1.ManagerController.getDirectMessages);
exports.default = route;
