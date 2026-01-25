import express from 'express';

const app = express();
const PORT = process.env.PORT || 3012;

app.get('/health', (req, res) => {
    res.status(200).send('Payment Service is healthy');
});

app.listen(PORT, () => {
    console.log(`Payment Service running on port ${PORT}`);
});
