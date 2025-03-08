import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request } from 'express';
import { IPlayer } from '../models/player.model';
import { TokenType } from '../models/jwt-token.model';
import JwtTokenRepository from '../repositories/jwt-token.repository';
import config from '../config/environment';
import logger from '../utils/logger';
import {PlayerRole} from "../models";

interface TokenPayload {
    id: string;
    email: string;
    role:string;
    [key: string]: any;
}

class JwtTokenService {
    /**
     * Generate access token
     */
    generateAccessToken(payload: TokenPayload): string {
        // @ts-ignore
        return jwt.sign(
            payload,
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRATION || '1h' }
        );
    }

    /**
     * Generate refresh token
     */
    generateRefreshToken(): string {
        return crypto.randomBytes(40).toString('hex');
    }

    /**
     * Parse JWT token expiration
     */
    parseJwtExpiration(token: string): Date {
        const decoded = jwt.decode(token) as { exp: number };

        if (!decoded || !decoded.exp) {
            throw new Error('Invalid token structure');
        }

        // exp is in seconds, Date expects milliseconds
        return new Date(decoded.exp * 1000);
    }

    /**
     * Create access token in the database
     */
    async createAccessToken(
        player: IPlayer,
        token: string,
        req?: Request
    ): Promise<string> {
        try {
            const expiresAt = this.parseJwtExpiration(token);

            // Optional device information
            const deviceInfo = req ? {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                // In a real app, you might have a more robust device ID system
                deviceId: req.headers['device-id'] as string
            } : undefined;

            await JwtTokenRepository.create({
                userId: player.id,
                token,
                type: TokenType.ACCESS,
                expiresAt,
                deviceInfo
            });

            return token;
        } catch (error) {
            logger.error(`Error in createAccessToken: ${error}`);
            throw error;
        }
    }

    /**
     * Create refresh token in the database
     */
    async createRefreshToken(
        player: IPlayer,
        token: string,
        req?: Request
    ): Promise<string> {
        try {
            // Set expiration (typically longer than access tokens)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

            // Optional device information
            const deviceInfo = req ? {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                deviceId: req.headers['device-id'] as string
            } : undefined;

            await JwtTokenRepository.create({
                userId: player.id,
                token,
                type: TokenType.REFRESH,
                expiresAt,
                deviceInfo
            });

            return token;
        } catch (error) {
            logger.error(`Error in createRefreshToken: ${error}`);
            throw error;
        }
    }

    /**
     * Generate token pair (access + refresh)
     */
    async generateTokenPair(
        player: IPlayer,
        req?: Request
    ): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            // Create payload
            const payload: TokenPayload = {
                id: player.id.toString(),
                email: player.email,
                role: player.role,
            };

            // Generate tokens
            const accessToken = this.generateAccessToken(payload);
            const refreshToken = this.generateRefreshToken();

            // Store tokens in database
            await this.createAccessToken(player, accessToken, req);
            await this.createRefreshToken(player, refreshToken, req);

            return { accessToken, refreshToken };
        } catch (error) {
            logger.error(`Error in generateTokenPair: ${error}`);
            throw error;
        }
    }

    /**
     * Verify access token
     */
    verifyAccessToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
        } catch (error) {
            logger.error(`Error in verifyAccessToken: ${error}`);
            throw error;
        }
    }

    /**
     * Verify refresh token
     */
    async verifyRefreshToken(token: string, userId: string): Promise<boolean> {
        try {
            const storedToken = await JwtTokenRepository.findByToken(token);

            if (!storedToken) {
                return false;
            }

            return (
                storedToken.userId.toString() === userId &&
                storedToken.type === TokenType.REFRESH &&
                !storedToken.isRevoked &&
                storedToken.expiresAt > new Date()
            );
        } catch (error) {
            logger.error(`Error in verifyRefreshToken: ${error}`);
            throw error;
        }
    }

    /**
     * Check if a token is valid (exists and not revoked)
     */
    async isTokenValid(token: string): Promise<boolean> {
        try {
            const storedToken = await JwtTokenRepository.findByToken(token);

            if (!storedToken) {
                return false;
            }

            return (
                !storedToken.isRevoked &&
                storedToken.expiresAt > new Date()
            );
        } catch (error) {
            logger.error(`Error in isTokenValid: ${error}`);
            throw error;
        }
    }

    /**
     * Refresh tokens - exchange refresh token for new token pair
     */
    async refreshTokens(
        refreshToken: string,
        player: IPlayer,
        req?: Request
    ): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            // Verify refresh token is valid
            const isValid = await this.verifyRefreshToken(refreshToken, player.id.toString());

            if (!isValid) {
                throw new Error('Invalid refresh token');
            }

            // Revoke the old refresh token
            const oldToken = await JwtTokenRepository.findByToken(refreshToken);
            if (oldToken) {
                await JwtTokenRepository.revokeToken(oldToken.id.toString());
            }

            // Generate new token pair
            return await this.generateTokenPair(player, req);
        } catch (error) {
            logger.error(`Error in refreshTokens: ${error}`);
            throw error;
        }
    }

    /**
     * Revoke all tokens for a player
     */
    async revokeAllTokens(userId: string): Promise<boolean> {
        try {
            return await JwtTokenRepository.revokeAllUserTokens(userId);
        } catch (error) {
            logger.error(`Error in revokeAllTokens: ${error}`);
            throw error;
        }
    }

    /**
     * Get all active sessions for a player
     */
    async getActiveSessions(userId: string): Promise<any[]> {
        try {
            const tokens = await JwtTokenRepository.findAllValidByUserId(userId);

            // Group tokens by device
            const sessions = tokens.reduce((acc: any[], token) => {
                // Look for existing session with same device info
                const existingSession = acc.find(session =>
                    session.deviceInfo?.deviceId === token.deviceInfo?.deviceId
                );

                if (existingSession) {
                    // Add token to existing session
                    existingSession.tokens.push({
                        id: token._id,
                        type: token.type,
                        expiresAt: token.expiresAt
                    });
                } else {
                    // Create new session
                    acc.push({
                        deviceInfo: token.deviceInfo,
                        lastActive: token.updatedAt,
                        tokens: [{
                            id: token._id,
                            type: token.type,
                            expiresAt: token.expiresAt
                        }]
                    });
                }

                return acc;
            }, []);

            return sessions;
        } catch (error) {
            logger.error(`Error in getActiveSessions: ${error}`);
            throw error;
        }
    }

    /**
     * Cleanup expired tokens (can be run as a scheduled job)
     */
    async cleanupExpiredTokens(): Promise<number> {
        try {
            return await JwtTokenRepository.deleteExpiredAndRevokedTokens();
        } catch (error) {
            logger.error(`Error in cleanupExpiredTokens: ${error}`);
            throw error;
        }
    }
}

export default new JwtTokenService();