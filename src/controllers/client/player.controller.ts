import { Request, Response } from 'express';
import PlayerService from '../../services/player.service';
import JwtTokenService from '../../services/jwt-token.service';
import { PlayerRole } from '../../models';
import logger from '../../utils/logger';

class PlayerController {
    /**
     * Register a new player
     * @route POST /api/players/register
     */
    async register(req: Request, res: Response): Promise<void> {
        try {
            const playerData = req.body;
            const { player } = await PlayerService.registerPlayer(playerData);
            res.status(201).json({
                success: true,
                message: 'Player registered successfully. Please verify your email.',
                player: {
                    id: player._id,
                    role: player.role,
                    email: player.email,
                    firstName: player.firstName,
                    lastName: player.lastName
                },

            });
        } catch (error: any) {
            logger.error(`Error in register: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Registration failed'
            });
        }
    }

    /**
     * Verify player account
     * @route GET /api/players/verify/:id/:token
     */
    async verifyAccount(req: Request, res: Response): Promise<void> {
        try {
            const { id, token } = req.params;

            const player = await PlayerService.verifyAccount(id, token);

            if (!player) {
                res.status(400).json({
                    success: false,
                    message: 'Verification failed'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Account verified successfully'
            });
        } catch (error: any) {
            logger.error(`Error in verifyAccount: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Verification failed'
            });
        }
    }

    /**
     * Login player
     * @route POST /api/players/login
     */
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            const { player, token } = await PlayerService.loginPlayer(email, password);

            // Generate token pair using our JWT service
            const { accessToken, refreshToken } = await JwtTokenService.generateTokenPair(player, req);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                accessToken,
                refreshToken
            });
        } catch (error: any) {
            logger.error(`Error in login: ${error.message}`);
            res.status(401).json({
                success: false,
                message: error.message || 'Authentication failed'
            });
        }
    }

    /**
     * Request password reset
     * @route POST /api/players/forgot-password
     */
    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;

            const resetToken = await PlayerService.forgotPassword(email);
            if (!resetToken) {
                res.status(200).json({
                    success: true,
                    message: 'Password reset link sent to your email',

                });
            }


        } catch (error: any) {
            logger.error(`Error in forgotPassword: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to send reset link'
            });
        }
    }

    /**
     * Reset password
     * @route POST /api/players/reset-password/:id/:token
     */
    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { id, token } = req.params;
            const { password } = req.body;

            const success = await PlayerService.resetPassword(id, token, password);

            if (!success) {
                res.status(400).json({
                    success: false,
                    message: 'Password reset failed'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Password reset successfully'
            });
        } catch (error: any) {
            logger.error(`Error in resetPassword: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Password reset failed'
            });
        }
    }

    /**
     * Change password (requires authentication)
     * @route POST /api/players/change-password
     */
    async changePassword(req: Request, res: Response): Promise<void> {
        try {
            const { currentPassword, newPassword } = req.body;
            const playerId = (req as any).user.id;

            const success = await PlayerService.changePassword(playerId, currentPassword, newPassword);

            if (!success) {
                res.status(400).json({
                    success: false,
                    message: 'Failed to change password'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error: any) {
            logger.error(`Error in changePassword: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to change password'
            });
        }
    }

    /**
     * Generate OTP for two-factor authentication
     * @route POST /api/players/generate-otp
     */
    async generateOTP(req: Request, res: Response): Promise<void> {
        try {
            const playerId = (req as any).user.id; // Set by auth middleware

            const otp = await PlayerService.generateTwoFactorOTP(playerId);

            // In a real application, you would send the OTP via SMS/email
            // For development, we'll return it in the response

            res.status(200).json({
                success: true,
                message: 'OTP generated successfully',
                // Only return OTP in development environment
                ...(process.env.NODE_ENV === 'development' && { otp })
            });
        } catch (error: any) {
            logger.error(`Error in generateOTP: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to generate OTP'
            });
        }
    }

    /**
     * Verify OTP
     * @route POST /api/players/verify-otp
     */
    async verifyOTP(req: Request, res: Response): Promise<void> {
        try {
            const { otp } = req.body;
            const playerId = (req as any).user.id; // Set by auth middleware

            const verified = await PlayerService.verifyTwoFactorOTP(playerId, otp);

            if (!verified) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid OTP'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'OTP verified successfully'
            });
        } catch (error: any) {
            logger.error(`Error in verifyOTP: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'OTP verification failed'
            });
        }
    }

    /**
     * Create a new team (requires authentication)
     * @route POST /api/players/teams
     */
    async createTeam(req: Request, res: Response): Promise<void> {
        try {
            const teamData = req.body;
            const playerId = (req as any).user.id; // Set by auth middleware

            const team = await PlayerService.createTeam(playerId, teamData);

            res.status(201).json({
                success: true,
                message: 'Team created successfully',
                team
            });
        } catch (error: any) {
            logger.error(`Error in createTeam: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create team'
            });
        }
    }

    /**
     * Join a team (requires authentication)
     * @route POST /api/players/teams/join
     */
    async joinTeam(req: Request, res: Response): Promise<void> {
        try {
            const { teamId, role } = req.body;
            const playerId = (req as any).user.id; // Set by auth middleware

            const success = await PlayerService.joinTeam(playerId, teamId, role as PlayerRole);

            if (!success) {
                res.status(400).json({
                    success: false,
                    message: 'Failed to join team'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Joined team successfully'
            });
        } catch (error: any) {
            logger.error(`Error in joinTeam: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to join team'
            });
        }
    }

    /**
     * Get player profile (requires authentication)
     * @route GET /api/players/profile
     */
    async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const playerId = (req as any).user.id; // Set by auth middleware

            const player = await PlayerService.getPlayerById(playerId);

            if (!player) {
                res.status(404).json({
                    success: false,
                    message: 'Player not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                player: {
                    id: player._id,
                    firstName: player.firstName,
                    lastName: player.lastName,
                    email: player.email,
                    imageUrl: player.imageUrl,
                    age: player.age,
                    jerseyNumber: player.jerseyNumber,
                    battingStyle: player.battingStyle,
                    bowlingStyle: player.bowlingStyle,
                    phone: player.phone,
                    universityId: player.universityId
                }
            });
        } catch (error: any) {
            logger.error(`Error in getProfile: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get profile'
            });
        }
    }

    /**
     * Update player profile (requires authentication)
     * @route PUT /api/players/profile
     */
    async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const playerId = (req as any).user.id; // Set by auth middleware
            const updateData = req.body;

            // Prevent updating sensitive fields
            delete updateData.password;
            delete updateData.email; // Email change would require verification

            // Update player
            const player = await PlayerService.updatePlayer(playerId, updateData);

            if (!player) {
                res.status(404).json({
                    success: false,
                    message: 'Player not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                player: {
                    id: player._id,
                    firstName: player.firstName,
                    lastName: player.lastName,
                    email: player.email,
                    imageUrl: player.imageUrl,
                    age: player.age,
                    jerseyNumber: player.jerseyNumber,
                    battingStyle: player.battingStyle,
                    bowlingStyle: player.bowlingStyle,
                    phone: player.phone
                }
            });
        } catch (error: any) {
            logger.error(`Error in updateProfile: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update profile'
            });
        }
    }

    /**
     * Refresh token
     * @route POST /api/players/refresh-token
     */
    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;
            const playerId = (req as any).user.id; // Set by auth middleware

            const player = await PlayerService.getPlayerById(playerId);

            if (!player) {
                res.status(404).json({
                    success: false,
                    message: 'Player not found'
                });
                return;
            }

            const tokens = await JwtTokenService.refreshTokens(refreshToken, player, req);

            res.status(200).json({
                success: true,
                ...tokens
            });
        } catch (error: any) {
            logger.error(`Error in refreshToken: ${error.message}`);
            res.status(401).json({
                success: false,
                message: error.message || 'Failed to refresh token'
            });
        }
    }

    /**
     * Logout
     * @route POST /api/players/logout
     */
    async logout(req: Request, res: Response): Promise<void> {
        try {
            const playerId = (req as any).user.id; // Set by auth middleware

            await JwtTokenService.revokeAllTokens(playerId);

            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error: any) {
            logger.error(`Error in logout: ${error.message}`);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to logout'
            });
        }
    }
}

export default new PlayerController();