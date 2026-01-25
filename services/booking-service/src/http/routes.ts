import express from 'express';

export const bookingRouter = express.Router();

bookingRouter.get('/', (req, res) => res.json({ bookings: [] }));
