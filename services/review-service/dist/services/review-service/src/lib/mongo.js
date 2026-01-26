"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = connectMongo;
const mongoose_1 = __importDefault(require("mongoose"));
let connectPromise = null;
async function connectMongo() {
    const uri = process.env.REVIEW_MONGODB_URL;
    if (!uri) {
        throw new Error('REVIEW_MONGODB_URL is not set');
    }
    // Reuse connection in dev/hot-reload scenarios.
    if (mongoose_1.default.connection.readyState === 1)
        return mongoose_1.default;
    if (connectPromise)
        return connectPromise;
    connectPromise = mongoose_1.default.connect(uri, {
        serverSelectionTimeoutMS: 5000,
    });
    try {
        const conn = await connectPromise;
        return conn;
    }
    finally {
        // Allow retry if connection failed.
        connectPromise = null;
    }
}
//# sourceMappingURL=mongo.js.map