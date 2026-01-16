"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSeason = parseSeason;
function parseSeason(season) {
    const [startYear, endYear] = season.split("/").map(Number);
    return {
        start: new Date(`${startYear}-01-01T00:00:00.000Z`),
        end: new Date(`${endYear}-12-31T23:59:59.999Z`),
    };
}
