import { Router } from "express";
import { upload } from "../../middlewares/multer";
import { AdminControl } from "./admin.controller";

const adminRouter = Router();
// Get all admins
adminRouter.get("/admins", AdminControl.getAllAdmin);
// Get tournament managers
adminRouter.get("/managers", AdminControl.getTournamentManagers);

adminRouter.post("/create",upload.single("logo"), AdminControl.createTournament);
adminRouter.put("/tournament", AdminControl.updateTournament);
// Delete tournament
adminRouter.delete("/tournament/:id", AdminControl.deleteTournament);
// delete admin
adminRouter.delete("/deleteAdmin/:id", AdminControl.deletedAdmin);
// Get teams inside tournament
adminRouter.get("/tournament/:id/teams", AdminControl.getTeamsInTournament);
// Assign manager
adminRouter.post(
  "/tournament/:id/assign-manager/:managerId",
  AdminControl.assignManagerToTournament
);
// Remove manager from tournament
adminRouter.delete(
  "/tournament/:managerId/:tournamentId",
  AdminControl.removeTournamentManager
);


// Create news (image required)
adminRouter.post(
  "/news",
  upload.single("image"),
  AdminControl.createNews
);
// Update news
adminRouter.put("/news/:id", upload.single("image"), AdminControl.updateNews);
// Delete news
adminRouter.delete("/news/:id", AdminControl.deleteNews);
// Get all news
adminRouter.get("/news/all", AdminControl.getAllNews);
adminRouter.get("/system/logs", AdminControl.getsystemLogs);

export default adminRouter;
