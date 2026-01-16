"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = requireAdmin;
const db_config_1 = require("../config/db.config");
function requireAdmin(roles) {
    return async (req, res, next) => {
        const user = req.user; // from requireAuth
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const admin = await db_config_1.prisma.admin.findUnique({
            where: { id: user.id },
        });
        if (!admin || !roles.includes(admin.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        req.admin = admin;
        next();
    };
}
