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
    Object.entries(update).filter(([_, v]) => v !== undefined),
  );
}

export async function withRetry(
  fn: () => Promise<void>,
  options: RetryOptions = {},
) {
  const { retries = 3, delayMs = 500, onFail, onRecover } = options;

  let lastError: Error | null = null;
  let recovered = false;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await fn();
      return;
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (!isRecoverable(lastError)) {
        break; // 🔥 stop retrying non-recoverable errors
      }

      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs * attempt));
      }
    }
  }

  if (onFail && lastError) {
    await onFail(lastError);
  }

  if (onRecover && lastError) {
    try {
      await onRecover();
      recovered = true;
    } catch (recoveryError: any) {
      lastError =
        recoveryError instanceof Error
          ? recoveryError
          : new Error(String(recoveryError));
    }
  }

  try {
    if (lastError) {
      const data = await AiService.analysisError(lastError);
      console.log(data);
      await notificationService.systemCall(data);
    }
  } catch (systemError) {
    console.error("SYSTEM ALERT FAILED", systemError);
  }
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
    { expiresIn: `${daysValid}d` }, // expires after `daysValid` days
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
