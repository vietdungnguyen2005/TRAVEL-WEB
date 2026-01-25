import express from 'express';
const router = express.Router();

router.post('/process', (req, res) => {
    res.send('Payments route');
});

export const paymentRoutes = router;
