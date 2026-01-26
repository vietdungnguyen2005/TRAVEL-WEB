"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consulGetHealthyInstances = consulGetHealthyInstances;
const axios_1 = __importDefault(require("axios"));
async function consulGetHealthyInstances(consulUrl, serviceName) {
    // Uses: /v1/health/service/<service>?passing=1
    const url = `${consulUrl.replace(/\/$/, '')}/v1/health/service/${encodeURIComponent(serviceName)}?passing=1`;
    const res = await axios_1.default.get(url, { timeout: 4000 });
    return res.data
        .map((x) => ({
        id: x.Service.ID,
        address: x.Service.Address,
        port: x.Service.Port,
    }))
        .filter((x) => Boolean(x.address) && Boolean(x.port));
}
//# sourceMappingURL=consul.client.js.map