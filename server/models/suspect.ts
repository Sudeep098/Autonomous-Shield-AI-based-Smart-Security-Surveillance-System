import { mongoose } from '../mongodb';

const SuspectSchema = new mongoose.Schema({
    suspectName: {
        type: String,
        required: true,
        index: true
    },
    detectionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    threatLevel: {
        type: String,
        enum: ['normal', 'suspicious', 'critical'],
        required: true,
        index: true
    },
    detectedAt: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    location: {
        cameraId: String,
        name: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    metadata: {
        bbox: {
            x: Number,
            y: Number,
            width: Number,
            height: Number
        },
        alertId: String,
        description: String
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Compound index for efficient queries
SuspectSchema.index({ threatLevel: 1, detectedAt: -1 });

export const Suspect = mongoose.model('Suspect', SuspectSchema);
