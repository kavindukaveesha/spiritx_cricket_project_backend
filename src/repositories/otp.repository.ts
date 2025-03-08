import OTPModel, { IOTP, OTPType } from '../models/otp.model';
import mongoose from 'mongoose';
import crypto from 'crypto';
import logger from '../utils/logger';

class OTPRepository {
    /**
     * Create a new OTP
     * @param userId User ID
     * @param email User email
     * @param type OTP type
     * @param expiresInMinutes Expiration time in minutes (default: 10)
     * @param length OTP length (default: 6)
     */
    async create(
        userId: string,
        email: string,
        type: OTPType,
        expiresInMinutes: number = 10,
        length: number = 6
    ): Promise<IOTP> {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID');
            }

            // Generate OTP code
            const code = Math.floor(Math.pow(10, length-1) + Math.random() * 9 * Math.pow(10, length-1)).toString();

            // Set expiration date
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

            // Invalidate any existing OTPs of this type for this user
            await this.invalidateExistingOTPs(userId, email, type);

            // Create new OTP
            const otp = new OTPModel({
                userId,
                email,
                code,
                type,
                expiresAt,
                isUsed: false,
                attempts: 0
            });

            return await otp.save();
        } catch (error) {
            logger.error(`Error creating OTP: ${error}`);
            throw error;
        }
    }

    /**
     * Verify an OTP
     * @param userId User ID
     * @param code OTP code
     * @param type OTP type
     */
    async verify(userId: string, code: string, type: OTPType): Promise<boolean> {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID');
            }

            // Find the OTP
            const otp = await OTPModel.findOne({
                userId,
                type,
                isUsed: false,
                expiresAt: { $gt: new Date() }
            });

            if (!otp) {
                return false;
            }

            // Increment attempts
            otp.attempts += 1;
            await otp.save();

            // Check if code matches
            if (otp.code !== code) {
                // Max attempts reached, invalidate the OTP
                if (otp.attempts >= 3) {
                    otp.isUsed = true;
                    await otp.save();
                }
                return false;
            }

            // Mark as used
            otp.isUsed = true;
            await otp.save();

            return true;
        } catch (error) {
            logger.error(`Error verifying OTP: ${error}`);
            throw error;
        }
    }

    /**
     * Find OTP by user ID and type
     * @param userId User ID
     * @param type OTP type
     */
    async findByUserIdAndType(userId: string, type: OTPType): Promise<IOTP | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID');
            }

            return await OTPModel.findOne({
                userId,
                type,
                isUsed: false,
                expiresAt: { $gt: new Date() }
            });
        } catch (error) {
            logger.error(`Error finding OTP: ${error}`);
            throw error;
        }
    }

    /**
     * Find OTP by email and type
     * @param email User email
     * @param type OTP type
     */
    async findByEmailAndType(email: string, type: OTPType): Promise<IOTP | null> {
        try {
            return await OTPModel.findOne({
                email,
                type,
                isUsed: false,
                expiresAt: { $gt: new Date() }
            });
        } catch (error) {
            logger.error(`Error finding OTP: ${error}`);
            throw error;
        }
    }

    /**
     * Invalidate an OTP
     * @param id OTP ID
     */
    async invalidate(id: string): Promise<IOTP | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid OTP ID');
            }

            return await OTPModel.findByIdAndUpdate(
                id,
                { $set: { isUsed: true } },
                { new: true }
            );
        } catch (error) {
            logger.error(`Error invalidating OTP: ${error}`);
            throw error;
        }
    }

    /**
     * Invalidate all existing OTPs for a user of a specific type
     * @param userId User ID
     * @param email User email
     * @param type OTP type
     */
    async invalidateExistingOTPs(userId: string, email: string, type: OTPType): Promise<void> {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID');
            }

            await OTPModel.updateMany(
                {
                    $or: [
                        { userId, type },
                        { email, type }
                    ],
                    isUsed: false
                },
                { $set: { isUsed: true } }
            );
        } catch (error) {
            logger.error(`Error invalidating existing OTPs: ${error}`);
            throw error;
        }
    }

    /**
     * Delete expired OTPs
     * This can be run as a scheduled task to clean up the database
     */
    async deleteExpiredOTPs(): Promise<number> {
        try {
            const result = await OTPModel.deleteMany({
                $or: [
                    { expiresAt: { $lt: new Date() } },
                    { isUsed: true }
                ]
            });

            return result.deletedCount;
        } catch (error) {
            logger.error(`Error deleting expired OTPs: ${error}`);
            throw error;
        }
    }
}

export default new OTPRepository();