"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = require("../../middlewares/multer");
const admin_controller_1 = require("./admin.controller");
const notifcation_controller_1 = require("../notifications/notifcation.controller");
const adminRouter = (0, express_1.Router)();
// Get all admins
adminRouter.get("/admins", admin_controller_1.AdminControl.getAllAdmin);
// Get tournament managers
adminRouter.get("/managers", admin_controller_1.AdminControl.getTournamentManagers);
adminRouter.post("/create", multer_1.upload.single("logo"), admin_controller_1.AdminControl.createTournament);
adminRouter.put("/tournament", admin_controller_1.AdminControl.updateTournament);
// Delete tournament
adminRouter.delete("/tournament/:id", admin_controller_1.AdminControl.deleteTournament);
// delete admin
adminRouter.delete("/deleteAdmin/:id", admin_controller_1.AdminControl.deletedAdmin);
// Get teams inside tournament
adminRouter.get("/tournament/:id/teams", admin_controller_1.AdminControl.getTeamsInTournament);
// Assign manager
adminRouter.post("/tournament/:id/assign-manager/:managerId", admin_controller_1.AdminControl.assignManagerToTournament);
// Remove manager from tournament
adminRouter.delete("/tournament/:managerId/:tournamentId", admin_controller_1.AdminControl.removeTournamentManager);
// Create news (image required)
adminRouter.post("/news/create", multer_1.upload.single("image"), admin_controller_1.AdminControl.createNews);
// Update news
adminRouter.put("/news/:id", multer_1.upload.single("image"), admin_controller_1.AdminControl.updateNews);
// Delete news
adminRouter.delete("/news/:id", admin_controller_1.AdminControl.deleteNews);
// Get all news
adminRouter.get("/news/all", admin_controller_1.AdminControl.getAllNews);
adminRouter.get("/system/logs", admin_controller_1.AdminControl.getsystemLogs);
//messages
adminRouter.get("/message/meta", admin_controller_1.AdminControl.getAllMessageMeta);
adminRouter.post("/message/send", admin_controller_1.AdminControl.sendDirectMessageToClients);
adminRouter.post("/message/mark/read/:id", admin_controller_1.AdminControl.markRead);
adminRouter.get("/message/manager/:id", admin_controller_1.AdminControl.getMessageOfAdmin);
//mail services
adminRouter.post("/mail/send/manager", notifcation_controller_1.NotificationController.sendMailToManager);
adminRouter.post("/mail/send/maintenance", notifcation_controller_1.NotificationController.sendMailToMaintenance);
exports.default = adminRouter;
