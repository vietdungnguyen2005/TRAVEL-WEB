import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    // Error handling logic here
    res.status(500).send({ error: err.message });
}
