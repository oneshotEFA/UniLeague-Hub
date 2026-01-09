import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.post("/user/update", AuthController.updateUser);
router.get("/user/me/:id", AuthController.getMe);
router.post("/changePassword", AuthController.changePassword)

export default router;
