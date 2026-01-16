"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("../../common/utils/utility");
const ai_service_1 = require("../../modules/_AI/ai.service");
const event_bus_1 = require("../event-bus");
const events_1 = require("../events");
event_bus_1.eventBus.on(events_1.TEAMPOWER, async (payload) => {
    await (0, utility_1.withRetry)(async () => {
        await ai_service_1.AiService.generateTeamPower(payload.awayTeamId);
        await ai_service_1.AiService.generateTeamPower(payload.homeTeamId);
    }, {
        retries: 5,
        onFail: async (error) => {
            console.error("Failed to update power of team:", payload, error);
            if (!(0, utility_1.isRecoverable)(error)) {
                // notificationService.systemCall()
            }
            //analysis the error and return the data
            // notificationService.systemCall()
        },
        onRecover: async () => { },
    });
});
