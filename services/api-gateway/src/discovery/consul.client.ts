import axios from 'axios';

export type ConsulServiceInstance = {
    Service: {
        ID: string;
        Service: string;
        Address: string;
        Port: number;
        Tags?: string[];
    };
    Checks?: Array<{ Status: string }>;
};

export async function consulGetHealthyInstances(consulUrl: string, serviceName: string) {
    // Uses: /v1/health/service/<service>?passing=1
    const url = `${consulUrl.replace(/\/$/, '')}/v1/health/service/${encodeURIComponent(serviceName)}?passing=1`;
    const res = await axios.get<ConsulServiceInstance[]>(url, { timeout: 4_000 });
    return res.data
        .map((x) => ({
            id: x.Service.ID,
            address: x.Service.Address,
            port: x.Service.Port,
        }))
        .filter((x) => Boolean(x.address) && Boolean(x.port));
}
