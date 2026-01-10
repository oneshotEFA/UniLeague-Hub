"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const utility_1 = require("../../common/utils/utility");
const db_config_1 = require("../../config/db.config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    constructor(prismaService = db_config_1.prisma) {
        this.prismaService = prismaService;
    }
    async signup(username, fullName, email, password) {
        try {
            const exists = await this.prismaService.admin.findFirst({
                where: { OR: [{ username }, { email }] },
            });
            if (exists) {
                return { ok: false, error: "User already exists" };
            }
            const hashed = await bcryptjs_1.default.hash(password, 10);
            const user = await this.prismaService.admin.create({
                data: {
                    username,
                    fullName,
                    email,
                    password: hashed,
                    role: "tournamentManager",
                },
            });
            return {
                ok: true,
                data: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                },
            };
        }
        catch (error) {
            return {
                ok: false,
                error: error.message,
            };
        }
    }
    async login(username, password) {
        try {
            const user = await this.prismaService.admin.findUnique({
                where: { username },
                include: {
                    tournaments: {
                        select: { id: true },
                    },
                },
            });
            if (!user) {
                return { ok: false, error: "Invalid Credential" };
            }
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return { ok: false, error: "Invalid Credential" };
            }
            const tid = user.tournaments?.[0]?.id ?? null;
            if (tid === null && user.role !== "superAdmin") {
                return {
                    ok: false,
                    error: "You are not authorized for tournament Management yet, or your eligibility has expired. Please contact the administrator for assistance.",
                };
            }
            const accessPayload = {
                id: user.id,
                username: user.username,
                role: user.role,
                tid,
            };
            const token = jsonwebtoken_1.default.sign(accessPayload, process.env.ACCESS_SECRET, {
                expiresIn: "59m",
            });
            const refreshPayload = { id: user.id };
            const refreshToken = jsonwebtoken_1.default.sign(refreshPayload, process.env.REFRESH_SECRET, { expiresIn: "7d" });
            const hashedRefresh = await bcryptjs_1.default.hash(refreshToken, 10);
            await this.prismaService.admin.update({
                where: { id: user.id },
                data: { refreshToken: hashedRefresh },
            });
            return {
                ok: true,
                data: {
                    id: user.id,
                    uName: user.username,
                    aToken: token,
                    rToken: refreshToken,
                    tid: accessPayload.tid,
                    role: user.role, // client needs this
                },
            };
        }
        catch (error) {
            return {
                ok: false,
                error: "An error occurred during login",
            };
        }
    }
    async updateUser(adminId, payload) {
        if (!adminId) {
            return { ok: false, error: "Admin ID is required" };
        }
        const data = {};
        if (payload.email?.trim()) {
            data.email = payload.email.trim().toLowerCase();
        }
        if (payload.username?.trim()) {
            data.username = payload.username.trim();
        }
        if (payload.fullName?.trim()) {
            data.fullName = payload.fullName.trim();
        }
        if (Object.keys(data).length === 0) {
            return { ok: false, error: "No valid fields to update" };
        }
        try {
            const updatedAdmin = await this.prismaService.admin.update({
                where: { id: adminId },
                data,
                select: {
                    id: true,
                    email: true,
                    username: true,
                    fullName: true,
                },
            });
            return {
                ok: true,
                data: updatedAdmin,
            };
        }
        catch (error) {
            if (error.code === "P2002") {
                return {
                    ok: false,
                    error: "Email or username already in use",
                };
            }
            return {
                ok: false,
                error: error.message,
            };
        }
    }
    async getMe(id) {
        try {
            const res = await this.prismaService.admin.findUnique({
                where: { id: id },
                select: {
                    id: true,
                    username: true,
                    fullName: true,
                    email: true,
                    tournaments: { select: { tournamentName: true } },
                },
            });
            if (!res) {
                return {
                    ok: false,
                    message: "no user found",
                };
            }
            return {
                ok: true,
                data: res,
            };
        }
        catch (error) {
            if (error.code === "P2002") {
                return {
                    ok: false,
                    error: "Email or username already in use",
                };
            }
            return {
                ok: false,
                error: error.message,
            };
        }
    }
    async changePassword(username, currentPassword, newPassword) {
        try {
            const user = await this.prismaService.admin.findUnique({
                where: { username },
            });
            if (!user) {
                return {
                    ok: false,
                    error: "no admin in this user name",
                };
            }
            const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isPasswordValid) {
            }
            const hasedPassword = await bcryptjs_1.default.hash(newPassword, 10);
            const changedPassword = await this.prismaService.admin.update({
                where: { username },
                data: { password: hasedPassword },
            });
            return {
                ok: true,
                data: changedPassword,
            };
        }
        catch (error) {
            return {
                ok: false,
                error: error.message,
            };
        }
    }
    async authPlayerRegistration(key) {
        try {
            const team = await this.prismaService.team.findUnique({
                where: { registrationKey: key },
            });
            if (!team) {
                return {
                    ok: false,
                    message: "No team found by this key",
                };
            }
            const today = new Date();
            today.setHours(0, 0, 0);
            if (!team.expiredRegistration) {
                return {
                    ok: false,
                    message: "Team not fully registered contact the manager",
                };
            }
            if (team.expiredRegistration < today) {
                return {
                    ok: false,
                    message: "registration date is expired",
                };
            }
            const accessPayload = {
                id: team.id,
            };
            const token = jsonwebtoken_1.default.sign(accessPayload, process.env.REGISTRATION_SECRET, {
                expiresIn: "30m",
            });
            return {
                ok: true,
                data: {
                    id: team.id,
                    aToken: token,
                },
            };
        }
        catch (error) {
            return {
                ok: false,
                message: (0, utility_1.getUserFriendlyError)(error),
            };
        }
    }
}
exports.AuthService = AuthService;
