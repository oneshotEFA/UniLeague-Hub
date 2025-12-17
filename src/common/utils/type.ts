export type RetryOptions = {
  retries?: number;
  delayMs?: number;
  onFail?: (error: Error) => Promise<void>;
  onRecover?: () => Promise<void>;
};
