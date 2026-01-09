import { recoverMatch } from "../../middlewares/errorHandler";
import { RetryOptions } from "./type";
import { AiService } from "../../modules/_AI/ai.service";
import jwt from "jsonwebtoken";
import { NotificationService } from "../../modules/notifications/notification.servie";
import { GalleryService } from "../../modules/gallery/gallery.service";
import { prisma } from "../../config/db.config";
const gallery = new GalleryService();
const notificationService = new NotificationService(prisma, gallery);
export function cleanData(update: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(update).filter(([_, v]) => v !== undefined)
  );
}

export async function withRetry(
  fn: () => Promise<void>,
  options: RetryOptions = {}
) {
  const { retries = 3, delayMs = 500, onFail, onRecover } = options;

  let lastError: Error | null = null;

  // 1️⃣ Normal retry attempts
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await fn();
      return; // success
    } catch (error: any) {
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
    } catch (recoveryError) {
      // recovery failed → escalate
      console.error("CRITICAL: Match recovery failed", {
        error: recoveryError,
      });
      throw recoveryError;
    }
  }
  console.log("alomost there");
  const data: {
    WhatType: string;
    message: string;
    category: string;
    messageDeveloper: string;
    severity: "critical" | "serious" | "warning" | "error";
  } = await AiService.analysisError(lastError);

  await notificationService.systemCall(data);
  throw lastError;
}
export function isRecoverable(error: any) {
  return (
    error?.code === "P2003" || // FK violation
    error?.code === "P2028" || // transaction error
    error?.code === "P2034" // deadlock
  );
}
export function generateTeamKey(teamId: string, daysValid: number = 30) {
  const token = jwt.sign(
    { teamId },
    process.env.TEAM_KEY_SECRET || "default_team_key_secret",
    { expiresIn: `${daysValid}d` } // expires after `daysValid` days
  );
  return token;
}
export function getUserFriendlyError(error: unknown): string {
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
