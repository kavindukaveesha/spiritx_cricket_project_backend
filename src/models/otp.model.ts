import mongoose, { Document, Schema } from 'mongoose';

// Define OTP type for different use cases
export enum OTPType {
    ACCOUNT_VERIFICATION = 'account_verification',
    PASSWORD_RESET = 'password_reset',
    LOGIN_VERIFICATION = 'login_verification',
    EMAIL_CHANGE = 'email_change'
}

// Define the interface for OTP document
export interface IOTP extends Document {
    userId: mongoose.Types.ObjectId;
    email: string;
    code: string;
    type: OTPType;
    expiresAt: Date;
    isUsed: boolean;
    attempts: number;
    createdAt: Date;
    updatedAt: Date;
}

// Create the OTP schema
const OTPSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'Player',
            required: [true, 'User ID is required']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true
        },
        code: {
            type: String,
            required: [true, 'OTP code is required']
        },
        type: {
            type: String,
            enum: Object.values(OTPType),
            required: [true, 'OTP type is required']
        },
        expiresAt: {
            type: Date,
            required: [true, 'Expiration date is required']
        },
        isUsed: {
            type: Boolean,
            default: false
        },
        attempts: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Create indexes for better query performance
OTPSchema.index({ userId: 1, type: 1 });
OTPSchema.index({ email: 1, type: 1 });
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index to automatically remove expired OTPs

// Create and export the OTP model
export default mongoose.model<IOTP>('OTP', OTPSchema);