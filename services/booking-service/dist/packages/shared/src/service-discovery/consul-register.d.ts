export type ConsulRegisterOptions = {
    consulUrl?: string;
    serviceName: string;
    serviceId?: string;
    address?: string;
    port: number;
    tags?: string[];
    healthCheckPath?: string;
    healthInterval?: string;
    deregisterAfter?: string;
};
export declare function consulRegisterService(opts: ConsulRegisterOptions): Promise<void>;
export declare function consulDeregisterService(serviceId: string, consulUrl?: string): Promise<void>;
//# sourceMappingURL=consul-register.d.ts.map