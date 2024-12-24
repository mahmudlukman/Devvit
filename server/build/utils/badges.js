"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignBadges = void 0;
const constants_1 = require("../constants");
const assignBadges = (params) => {
    const badgeCounts = {
        GOLD: 0,
        SILVER: 0,
        BRONZE: 0,
    };
    const { criteria } = params;
    criteria.forEach((item) => {
        const { type, count } = item;
        const badgeLevels = constants_1.BADGE_CRITERIA[type];
        Object.keys(badgeLevels).forEach((level) => {
            if (count >= badgeLevels[level]) {
                badgeCounts[level] += 1;
            }
        });
    });
    return badgeCounts;
};
exports.assignBadges = assignBadges;
