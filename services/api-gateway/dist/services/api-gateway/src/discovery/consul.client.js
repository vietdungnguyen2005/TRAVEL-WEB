"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consulGetHealthyInstances = consulGetHealthyInstances;
const shared_1 = require("@travel-web/shared");
async function consulGetHealthyInstances(consulUrl, serviceName) {
    // Uses: /v1/health/service/<service>?passing=1
    const url = `${consulUrl.replace(/\/$/, '')}/v1/health/service/${encodeURIComponent(serviceName)}?passing=1`;
    const res = await shared_1.httpClient.get(url);
    return res.data
        .map((x) => ({
        id: x.Service.ID,
        address: x.Service.Address,
        port: x.Service.Port,
    }))
        .filter((x) => Boolean(x.address) && Boolean(x.port));
}
//# sourceMappingURL=consul.client.js.map