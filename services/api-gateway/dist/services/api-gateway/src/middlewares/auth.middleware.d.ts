import type { NextFunction, Request, Response } from 'express';
export type AuthContext = {
    userId: string;
    role: string;
};
export type RequestWithAuth = Request & {
    auth?: AuthContext;
};
export declare function requireAuthForPaths(paths: string[], publicExceptions?: string[]): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare function requireAdminForPaths(paths: string[]): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=auth.middleware.d.ts.map