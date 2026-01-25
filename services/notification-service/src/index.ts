import express from 'express';

const app = express();
const PORT = process.env.PORT || 3010;

app.get('/health', (req, res) => res.send('Notification service healthy'));

app.listen(PORT, () => {
    console.log(`Notification service running on port ${PORT}`);
});
