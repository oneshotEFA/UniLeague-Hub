import { Router } from "express";
import { upload } from "../../middlewares/multer";
import { AdminControl } from "./admin.controller";
import { NotificationController } from "../notifications/notifcation.controller";
import { reqAuth } from "../../middlewares/reqAuth";
import { requireAdmin } from "../../middlewares/reqPermission";

const adminRouter = Router();
// Get all admins
adminRouter.get(
  "/admins",
  reqAuth,
  requireAdmin(["superAdmin"]),
  AdminControl.getAllAdmin
);
// Get tournament managers
adminRouter.get(
  "/managers",
  reqAuth,
  requireAdmin(["superAdmin"]),
  AdminControl.getTournamentManagers
);
adminRouter.post(
  "/manager/create",
  reqAuth,
  requireAdmin(["superAdmin"]),
  AdminControl.createManager
);
adminRouter.post(
  "/manager/mail/resend",
  reqAuth,
  requireAdmin(["superAdmin"]),
  AdminControl.resendCredential
);

adminRouter.post(
  "/create",
  reqAuth,
  requireAdmin(["superAdmin"]),
  upload.single("logo"),
  AdminControl.createTournament
);
adminRouter.put(
  "/tournament",
  reqAuth,
  requireAdmin(["superAdmin"]),
  AdminControl.updateTournament
);
// Delete tournament
adminRouter.delete(
  "/tournament/:id",
  reqAuth,
  requireAdmin(["superAdmin"]),
  AdminControl.deleteTournament
);
// delete admin
adminRouter.delete(
  "/deleteAdmin/:id",
  reqAuth,
  requireAdmin(["superAdmin"]),
  AdminControl.deletedAdmin
);
// Get teams inside tournament
adminRouter.get(
  "/tournament/:id/teams",
  reqAuth,
  requireAdmin(["superAdmin"]),
  AdminControl.getTeamsInTournament
);
// Assign manager
adminRouter.post(
  "/tournament/:id/assign-manager/:managerId",
  reqAuth,
  requireAdmin(["superAdmin"]),
  AdminControl.assignManagerToTournament
);
// Remove manager from tournament
adminRouter.delete(
  "/tournament/:managerId/:tournamentId",
  reqAuth,
  requireAdmin(["superAdmin"]),
  AdminControl.removeTournamentManager
);

// Create news (image required)
adminRouter.post(
  "/news/create",
  reqAuth,
  requireAdmin(["superAdmin"]),
  upload.single("image"),
  AdminControl.createNews
);
// Update news
adminRouter.put(
  "/news/:id",
  upload.single("image"),
  reqAuth,
  requireAdmin(["superAdmin"]),
  AdminControl.updateNews
);
// Delete news
adminRouter.delete(
  "/news/:id",
  reqAuth,
  requireAdmin(["superAdmin"]),
  AdminControl.deleteNews
);
// Get all news
adminRouter.get(
  "/news/all",
  reqAuth,
  requireAdmin(["superAdmin"]),
  AdminControl.getAllNews
);
adminRouter.get(
  "/system/logs",
  reqAuth,
  requireAdmin(["superAdmin"]),
  AdminControl.getsystemLogs
);

//messages

adminRouter.get(
  "/message/meta",
  reqAuth,
  requireAdmin(["superAdmin"]),
  AdminControl.getAllMessageMeta
);
adminRouter.post(
  "/message/send",
  reqAuth,
  requireAdmin(["superAdmin"]),
  AdminControl.sendDirectMessageToClients
);
adminRouter.post(
  "/message/mark/read/:id",
  reqAuth,
  requireAdmin(["superAdmin"]),
  AdminControl.markRead
);
adminRouter.get(
  "/message/manager/:id",
  reqAuth,
  requireAdmin(["superAdmin"]),
  AdminControl.getMessageOfAdmin
);

//mail services
adminRouter.post(
  "/mail/send/manager",
  reqAuth,
  requireAdmin(["superAdmin"]),
  NotificationController.sendMailToManager
);
adminRouter.post(
  "/mail/send/maintenance",
  reqAuth,
  requireAdmin(["superAdmin"]),
  NotificationController.sendMailToMaintenance
);
export default adminRouter;
