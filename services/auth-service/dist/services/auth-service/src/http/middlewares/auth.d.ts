import type { Request, Response, NextFunction } from 'express';
export declare function requireAuth(req: Request, _res: Response, next: NextFunction): void;
export declare function requireRole(role: string): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map