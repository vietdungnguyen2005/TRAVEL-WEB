import express from 'express';

const app = express();
const PORT = process.env.PORT || 3030;

app.get('/health', (req, res) => res.send('Room service healthy'));

app.listen(PORT, () => {
    console.log(`Room service running on port ${PORT}`);
});
