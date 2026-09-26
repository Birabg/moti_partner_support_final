"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNextMemberNumber = exports.generateNextStaffNumber = exports.formatUserNumber = exports.extractUserNumberSequence = exports.MEMBER_NUMBER_PREFIX = exports.STAFF_NUMBER_PREFIX = void 0;
const database_1 = require("../config/database");
exports.STAFF_NUMBER_PREFIX = "ST-";
exports.MEMBER_NUMBER_PREFIX = "ME-";
const NUMBER_PADDING = 6;
const extractUserNumberSequence = (userNumber) => {
    if (!userNumber)
        return 0;
    const match = userNumber.match(/(\d+)$/);
    if (!match)
        return 0;
    return Number(match[1]);
};
exports.extractUserNumberSequence = extractUserNumberSequence;
const formatUserNumber = (prefix, sequence) => `${prefix}${String(sequence).padStart(NUMBER_PADDING, "0")}`;
exports.formatUserNumber = formatUserNumber;
const generateNextUserNumberFor = async (tx, model, prefix, numberField) => {
    let sequence = 1;
    const latest = await tx[model].findFirst({
        where: {
            [numberField]: { startsWith: prefix },
        },
        orderBy: {
            [numberField]: "desc",
        },
        select: {
            [numberField]: true,
        },
    });
    if (latest?.[numberField]) {
        sequence = (0, exports.extractUserNumberSequence)(latest[numberField]) + 1;
    }
    let candidate = (0, exports.formatUserNumber)(prefix, sequence);
    while (await tx[model].findUnique({ where: { [numberField]: candidate } }).catch(() => null)) {
        sequence += 1;
        candidate = (0, exports.formatUserNumber)(prefix, sequence);
    }
    return candidate;
};
const generateNextStaffNumber = (tx = database_1.prisma) => generateNextUserNumberFor(tx, "staff", exports.STAFF_NUMBER_PREFIX, "staffNumber");
exports.generateNextStaffNumber = generateNextStaffNumber;
const generateNextMemberNumber = (tx = database_1.prisma) => generateNextUserNumberFor(tx, "customer", exports.MEMBER_NUMBER_PREFIX, "memberNumber");
exports.generateNextMemberNumber = generateNextMemberNumber;
