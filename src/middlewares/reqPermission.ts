import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db.config";
type role = "tournamentManager" | "superAdmin" | "coach";
export function requireAdmin(roles: role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user; // from requireAuth

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: user.id },
    });

    if (!admin || !roles.includes(admin.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    (req as any).admin = admin;
    next();
  };
}
