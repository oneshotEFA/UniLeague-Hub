"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanData = cleanData;
exports.withRetry = withRetry;
exports.isRecoverable = isRecoverable;
exports.generateTeamKey = generateTeamKey;
exports.getUserFriendlyError = getUserFriendlyError;
const ai_service_1 = require("../../modules/_AI/ai.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const notification_servie_1 = require("../../modules/notifications/notification.servie");
const gallery_service_1 = require("../../modules/gallery/gallery.service");
const db_config_1 = require("../../config/db.config");
const gallery = new gallery_service_1.GalleryService();
const notificationService = new notification_servie_1.NotificationService(db_config_1.prisma, gallery);
function cleanData(update) {
    return Object.fromEntries(Object.entries(update).filter(([_, v]) => v !== undefined));
}
async function withRetry(fn, options = {}) {
    const { retries = 3, delayMs = 500, onFail, onRecover } = options;
    let lastError = null;
    // 1️⃣ Normal retry attempts
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await fn();
            return; // success
        }
        catch (error) {
            lastError = error;
            if (attempt < retries) {
                await new Promise((r) => setTimeout(r, delayMs * attempt));
            }
        }
    }
    // 2️⃣ Mark as failed (soft failure)
    if (onFail && lastError) {
        await onFail(lastError);
    }
    // 3️⃣ Attempt recovery (hard fix)
    if (onRecover) {
        try {
            await onRecover();
            return; // recovery success = job success
        }
        catch (recoveryError) {
            // recovery failed → escalate
            console.error("CRITICAL: Match recovery failed", {
                error: recoveryError,
            });
            throw recoveryError;
        }
    }
    console.log("alomost there");
    const data = await ai_service_1.AiService.analysisError(lastError);
    await notificationService.systemCall(data);
    throw lastError;
}
function isRecoverable(error) {
    return (error?.code === "P2003" || // FK violation
        error?.code === "P2028" || // transaction error
        error?.code === "P2034" // deadlock
    );
}
function generateTeamKey(teamId, daysValid = 30) {
    const token = jsonwebtoken_1.default.sign({ teamId }, process.env.TEAM_KEY_SECRET || "default_team_key_secret", { expiresIn: `${daysValid}d` } // expires after `daysValid` days
    );
    return token;
}
function getUserFriendlyError(error) {
    if (error instanceof Error) {
        // Common known cases
        if (error.message.includes("Unique constraint")) {
            return "This record already exists.";
        }
        if (error.message.includes("not found")) {
            return "Requested resource was not found.";
        }
        if (error.message.includes("ECONNREFUSED")) {
            return "Service is temporarily unavailable. Please try again later.";
        }
        return "Something went wrong. Please try again.";
    }
    return "Unexpected error occurred.";
}
