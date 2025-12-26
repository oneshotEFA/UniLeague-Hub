import { recoverMatch } from "../../middlewares/errorHandler";
import { RetryOptions } from "./type";
import { AiService } from "../../modules/_AI/ai.service";

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
  const data = await AiService.analysisError(lastError);

  //await NotificationService.systemCal(data);
  throw lastError;
}
export function isRecoverable(error: any) {
  return (
    error?.code === "P2003" || // FK violation
    error?.code === "P2028" || // transaction error
    error?.code === "P2034" // deadlock
  );
}
