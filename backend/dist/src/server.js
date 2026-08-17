"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const corn_worker_1 = require("./utils/corn.worker");
const notification_listner_1 = require("./modules/notifications/notification.listner");
const startServer = async () => {
    try {
        await database_1.prisma.$connect();
        console.log("Database connection successfully established via Prisma Client.");
        app_1.default.listen(env_1.ENV.PORT, () => {
            console.log(`MOTI Support Portal API running cleanly on port ${env_1.ENV.PORT}`);
            (0, notification_listner_1.initializeNotificationListeners)();
            (0, corn_worker_1.startCaseTimeoutWorker)();
        });
    }
    catch (error) {
        console.error("Critical Error: Server initialization aborted!", error);
        process.exit(1);
    }
};
startServer();
