import { IJwtToken, TokenType } from '../models/jwt-token.model';
import JwtTokenModel from '../models/jwt-token.model';
import mongoose from 'mongoose';

class JwtTokenRepository {
    /**
     * Create a new JWT token
     */
    async create(tokenData: Partial<IJwtToken>): Promise<IJwtToken> {
        try {
            const token = new JwtTokenModel(tokenData);
            return await token.save();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Find token by its value
     */
    async findByToken(token: string): Promise<IJwtToken | null> {
        try {
            return await JwtTokenModel.findOne({ token });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Find token by user ID and type
     */
    async findByUserIdAndType(userId: string, type: TokenType): Promise<IJwtToken | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID');
            }

            return await JwtTokenModel.findOne({
                userId,
                type,
                isRevoked: false,
                expiresAt: { $gt: new Date() }
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Find all tokens for a user
     */
    async findAllByUserId(userId: string): Promise<IJwtToken[]> {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID');
            }

            return await JwtTokenModel.find({ userId });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Find all valid tokens for a user (not expired, not revoked)
     */
    async findAllValidByUserId(userId: string): Promise<IJwtToken[]> {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID');
            }

            return await JwtTokenModel.find({
                userId,
                isRevoked: false,
                expiresAt: { $gt: new Date() }
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Revoke a token
     */
    async revokeToken(tokenId: string): Promise<IJwtToken | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(tokenId)) {
                throw new Error('Invalid token ID');
            }

            return await JwtTokenModel.findByIdAndUpdate(
                tokenId,
                { $set: { isRevoked: true } },
                { new: true }
            );
        } catch (error) {
            throw error;
        }
    }

    /**
     * Revoke all tokens for a user
     */
    async revokeAllUserTokens(userId: string): Promise<boolean> {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID');
            }

            const result = await JwtTokenModel.updateMany(
                { userId },
                { $set: { isRevoked: true } }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Revoke all tokens for a user by type
     */
    async revokeAllUserTokensByType(userId: string, type: TokenType): Promise<boolean> {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID');
            }

            const result = await JwtTokenModel.updateMany(
                { userId, type },
                { $set: { isRevoked: true } }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete all expired and revoked tokens
     * This can be used in a cron job to clean up the database
     */
    async deleteExpiredAndRevokedTokens(): Promise<number> {
        try {
            const result = await JwtTokenModel.deleteMany({
                $or: [
                    { expiresAt: { $lt: new Date() } },
                    { isRevoked: true }
                ]
            });

            return result.deletedCount;
        } catch (error) {
            throw error;
        }
    }
}

export default new JwtTokenRepository();