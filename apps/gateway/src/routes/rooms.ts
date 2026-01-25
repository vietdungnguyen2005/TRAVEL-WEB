import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Rooms route');
});

export const roomRoutes = router;
