export type ConsulServiceInstance = {
    Service: {
        ID: string;
        Service: string;
        Address: string;
        Port: number;
        Tags?: string[];
    };
    Checks?: Array<{
        Status: string;
    }>;
};
export declare function consulGetHealthyInstances(consulUrl: string, serviceName: string): Promise<{
    id: string;
    address: string;
    port: number;
}[]>;
//# sourceMappingURL=consul.client.d.ts.map