import { isRecoverable, withRetry } from "../../common/utils/utility";
import { AiService } from "../../modules/_AI/ai.service";
import { eventBus } from "../event-bus";
import { TEAMPOWER } from "../events";

eventBus.on(
  TEAMPOWER,
  async (payload: { homeTeamId: string; awayTeamId: string }) => {
    await withRetry(
      async () => {
        await AiService.generateTeamPower(payload.awayTeamId);
        await AiService.generateTeamPower(payload.homeTeamId);
      },
      {
        retries: 5,
        onFail: async (error) => {
          console.error("Failed to update power of team:", payload, error);
          if (!isRecoverable(error)) {
            // notificationService.systemCall()
          }
          //analysis the error and return the data
          // notificationService.systemCall()
        },
        onRecover: async () => {},
      }
    );
  }
);
