"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPastDaysRange = getPastDaysRange;
exports.getNextDaysRange = getNextDaysRange;
function getPastDaysRange(days) {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    return { start, end };
}
function getNextDaysRange(days) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}
