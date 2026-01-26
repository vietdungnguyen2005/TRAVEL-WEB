import { DiscoveryMode } from '../config/discovery.config';
import { services as staticServices } from '../config/services.config';
type ServiceName = keyof typeof staticServices;
export declare function getServiceTarget(serviceKey: ServiceName, mode?: DiscoveryMode): Promise<string>;
export {};
//# sourceMappingURL=service-resolver.d.ts.map