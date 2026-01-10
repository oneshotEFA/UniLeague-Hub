"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = __importDefault(require("../modules/auth/auth.route"));
const aiRoute_1 = __importDefault(require("../modules/_AI/aiRoute"));
const player_route_1 = __importDefault(require("../modules/players/player.route"));
const team_route_1 = __importDefault(require("../modules/teams/team.route"));
const macth_event_route_1 = __importDefault(require("../modules/match-events/macth-event.route"));
const match_route_1 = __importDefault(require("../modules/matches/match.route"));
const tournament_route_1 = __importDefault(require("../modules/tournaments/tournament.route"));
const manager_route_1 = __importDefault(require("../modules/admin/manager.route"));
const notification_route_1 = __importDefault(require("../modules/notifications/notification.route"));
const admin_route_1 = __importDefault(require("../modules/admin/admin.route"));
const gallery_route_1 = __importDefault(require("../modules/gallery/gallery.route"));
const apiRouter = (0, express_1.Router)();
apiRouter.use("/auth", auth_route_1.default);
apiRouter.use("/tournaments", tournament_route_1.default);
apiRouter.use("/ai", aiRoute_1.default); // Placeholder for user routes
apiRouter.use("/player", player_route_1.default);
apiRouter.use("/teams", team_route_1.default);
apiRouter.use("/event", macth_event_route_1.default);
apiRouter.use("/matches", match_route_1.default); // Placeholder for match routes
apiRouter.use("/manager", manager_route_1.default);
apiRouter.use("/notification", notification_route_1.default);
apiRouter.use("/admin", admin_route_1.default);
apiRouter.use("/gallery", gallery_route_1.default);
exports.default = apiRouter;
