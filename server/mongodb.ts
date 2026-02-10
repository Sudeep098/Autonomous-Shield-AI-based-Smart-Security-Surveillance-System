import mongoose from 'mongoose';

let isConnected = false;

export async function connectMongoDB() {
    if (isConnected) {
        console.log('MongoDB already connected');
        return;
    }

    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/autonomous_shield';

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });

        isConnected = true;
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        // Don't throw - allow app to run without MongoDB if it fails
    }
}

export { mongoose };
