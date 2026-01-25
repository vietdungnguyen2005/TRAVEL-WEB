import express from 'express';
const router = express.Router();

router.post('/login', (req, res) => {
    res.send('Auth route');
});

export const authRoutes = router;
