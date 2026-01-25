import express from 'express';

const app = express();
const PORT = process.env.PORT || 3020;

app.get('/health', (req, res) => res.send('Review service healthy'));

app.listen(PORT, () => {
    console.log(`Review service running on port ${PORT}`);
});
