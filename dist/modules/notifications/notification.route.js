"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notifcation_controller_1 = require("./notifcation.controller");
const express_1 = require("express");
const notficationRouter = (0, express_1.Router)();
notficationRouter.get("/:id/admin", notifcation_controller_1.NotificationController.getAdminNotification);
notficationRouter.get("/broadcast/:page", notifcation_controller_1.NotificationController.getBroadCastNotification);
notficationRouter.get("/:id/tournament", notifcation_controller_1.NotificationController.getTournamentBroadCast);
exports.default = notficationRouter;
