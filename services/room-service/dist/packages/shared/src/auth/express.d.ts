import type { NextFunction, Request, Response } from 'express';
export declare function verifyJWT(req: Request, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
export declare function requireRole(role: string): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare function tryGetUserFromRequest(req: Request): import("./jwt").JwtUser | null;
//# sourceMappingURL=express.d.ts.map