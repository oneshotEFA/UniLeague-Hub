import { isRecoverable, withRetry } from "../../common/utils/utility";
import { AiService } from "../../modules/_AI/ai.service";
import { eventBus } from "../event-bus";
import { TEAMPOWER } from "../events";

eventBus.on(
  TEAMPOWER,
  async (payload: { homeTeamId: string; awayTeamId: string }) => {
    await withRetry(
      async () => {
        const res = await AiService.generateTeamPower(payload.awayTeamId);
        const res1 = await AiService.generateTeamPower(payload.homeTeamId);
        if (!res.ok || !res1.ok) {
          throw Error(res.error);
        }
      },
      {
        retries: 5,
        onFail: async (error) => {},
        onRecover: async () => {},
      }
    );
  }
);
