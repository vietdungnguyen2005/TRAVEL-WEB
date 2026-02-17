import type { NextFunction, Request, Response } from 'express';
import { type JwtUser } from './jwt';
export declare function verifyJWT(req: Request, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
export declare function requireRole(role: string): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare function tryGetUserFromRequest(req: Request): JwtUser | null;
//# sourceMappingURL=express.d.ts.map