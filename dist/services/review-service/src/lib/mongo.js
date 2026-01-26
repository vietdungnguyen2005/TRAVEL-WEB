import mongoose from 'mongoose';
let connectPromise = null;
export async function connectMongo() {
    const uri = process.env.REVIEW_MONGODB_URL;
    if (!uri) {
        throw new Error('REVIEW_MONGODB_URL is not set');
    }
    // Reuse connection in dev/hot-reload scenarios.
    if (mongoose.connection.readyState === 1)
        return mongoose;
    if (connectPromise)
        return connectPromise;
    connectPromise = mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
    });
    try {
        const conn = await connectPromise;
        return conn;
    }
    finally {
        // Allow retry if connection failed.
        connectPromise = null;
    }
}
//# sourceMappingURL=mongo.js.map