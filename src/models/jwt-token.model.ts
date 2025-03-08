import mongoose, { Document, Schema } from 'mongoose';

// Define enum for token types
export enum TokenType {
    ACCESS = 'access',
    REFRESH = 'refresh',
    RESET = 'reset',
    VERIFY = 'verify'
}

// Define the interface for JWT Token document
export interface IJwtToken extends Document {
    userId: mongoose.Types.ObjectId;
    token: string;
    type: TokenType;
    expiresAt: Date;
    isRevoked: boolean;
    deviceInfo?: {
        ip?: string;
        userAgent?: string;
        deviceId?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

// Create the JWT Token schema
const JwtTokenSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'Player', // Reference to the Player model
            required: [true, 'User ID is required']
        },
        token: {
            type: String,
            required: [true, 'Token is required'],
            index: true
        },
        type: {
            type: String,
            enum: Object.values(TokenType),
            required: [true, 'Token type is required']
        },
        expiresAt: {
            type: Date,
            required: [true, 'Token expiration date is required']
        },
        isRevoked: {
            type: Boolean,
            default: false
        },
        deviceInfo: {
            ip: String,
            userAgent: String,
            deviceId: String
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Create indexes for better query performance
JwtTokenSchema.index({ userId: 1, type: 1 });
JwtTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index to automatically remove expired tokens

// Create and export the JWT Token model
export default mongoose.model<IJwtToken>('JwtToken', JwtTokenSchema);