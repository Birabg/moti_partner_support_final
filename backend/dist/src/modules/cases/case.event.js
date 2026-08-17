"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CASE_EVENTS = exports.CaseEventBroker = void 0;
const events_1 = require("events");
exports.CaseEventBroker = new events_1.EventEmitter();
exports.CASE_EVENTS = {
    CREATED: "case.created",
    ASSIGNED: "case.assigned",
    PRIORITY_CHANGED: "case.priority_changed",
    RESOLVED: "case.resolved",
    CLOSED: "case.closed",
    REOPENED: "case.reopened",
};
