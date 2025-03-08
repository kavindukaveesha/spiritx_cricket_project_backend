import PlayerRepository from "../repositories/player.repository";
import OTPService from "./otp.service";
import EmailService from "./email.service";
import {IPlayer, PlayerRole, ITeam, Role} from "../models";
import TeamModel from "../models/team.model";
import * as crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/environment";
import logger from "../utils/logger";
import mongoose from "mongoose";
import {RegistrationStatus} from "../models/player.model";

// For token storage (in a real app, use a database)
const tokenStore: Record<string, { token: string; expires: Date; type: string }> = {};

class PlayerService {
    /**
     * Register a new player
     * @param playerData Player registration data
     */
    async registerPlayer(playerData: Partial<IPlayer>): Promise<{ player: IPlayer; message: string }> {
        try {
            // Check if email already exists
            const existingPlayer = await PlayerRepository.findByEmail(playerData.email as string);
            if (existingPlayer) {
                throw new Error("Email already registered");
            }

            // Set initial verification status to false
            playerData.isVerified = false;
            playerData.isActive = true;
            playerData.role = Role.PLAYER;

            // Create the player
            const player = await PlayerRepository.create(playerData);

            // Generate and send verification OTP
            await OTPService.generateVerificationOTP(player);

            logger.info(`Player registered and verification OTP sent to: ${player.email}`);

            return {
                player,
                message: "Registration successful. Please check your email for verification code.",
            };
        } catch (error: any) {
            logger.error(`Error in registerPlayer: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify player account using OTP
     * @param id Player email
     * @param otp Verification OTP
     */
    async verifyAccount(id: string, otp: string): Promise<IPlayer | null> {
        try {
            const player = await PlayerRepository.findById(id);
            if (!player) {
                throw new Error("Player not found");
            }

            // Verify OTP
            const isValid = await OTPService.verifyAccountOTP(player.id.toString(), otp);
            if (!isValid) {
                throw new Error("Invalid or expired verification code");
            }

            // Update player's verification status
            const updatedPlayer = await PlayerRepository.setVerificationStatus(player.id.toString(), true);

            // Send welcome email
            if (updatedPlayer) {
                const dashboardURL = `${config.FRONTEND_URL}/dashboard`;
                await EmailService.sendWelcomeEmail(updatedPlayer, dashboardURL);
            }

            return updatedPlayer;
        } catch (error: any) {
            logger.error(`Error in verifyAccount: ${error.message}`);
            throw error;
        }
    }

    /**
     * Resend verification OTP
     * @param email Player email
     */
    async resendVerificationOTP(email: string): Promise<boolean> {
        try {
            const player = await PlayerRepository.findByEmail(email);
            if (!player) {
                throw new Error("Player not found");
            }

            if (player.isVerified) {
                throw new Error("Account is already verified");
            }

            // Generate and send new verification OTP
            await OTPService.generateVerificationOTP(player);

            logger.info(`Verification OTP resent to: ${player.email}`);

            return true;
        } catch (error: any) {
            logger.error(`Error in resendVerificationOTP: ${error.message}`);
            throw error;
        }
    }

    /**
     * Login player
     * @param email Player email
     * @param password Player password
     */
    async loginPlayer(email: string, password: string): Promise<{ player: IPlayer; token: string }> {
        try {
            // Get player with password
            const player = await PlayerRepository.findByEmailWithPassword(email);
            if (!player) {
                throw new Error("Invalid credentials");
            }

            // Check if player is active
            if (!player.isActive) {
                throw new Error("Account is deactivated. Please contact support.");
            }

            // Check if player is verified
            if (!player.isVerified) {
                throw new Error("Account is not verified. Please verify your email first.");
            }

            // Check password
            const isMatch = await player.comparePassword(password);
            if (!isMatch) {
                throw new Error("Invalid credentials");
            }

            // Determine the player's role
            let role = "player"; // Default role
            // const captainTeam = await TeamRepository.findOne({ captainId: player._id }); // Check if player is a captain
            // if (captainTeam) {
            //     role = "captain";
            // }

            // Generate JWT token with role
            const token = jwt.sign(
                { id: player.id.toString(), email: player.email, role:role.toString() },
                config.JWT_SECRET,
                { expiresIn: config.JWT_EXPIRATION as jwt.SignOptions["expiresIn"] }
            );

            return { player, token };
        } catch (error: any) {
            logger.error(`Error in loginPlayer: ${error.message}`);
            throw error;
        }
    }

    /**
     * Request password reset
     * @param email Player email
     */
    async forgotPassword(email: string): Promise<string> {
        try {
            const player = await PlayerRepository.findByEmail(email);
            if (!player) {
                throw new Error("No account found with that email");
            }

            // Generate and send password reset OTP
           let opt = await OTPService.generatePasswordResetOTP(player);
            if (!opt){
                logger.error(`error`);
            }
            return "Password reset instructions sent to your email";
        } catch (error: any) {
            logger.error(`Error in forgotPassword: ${error.message}`);
            throw error;
        }
    }

    /**
     * Reset password using OTP
     * @param email Player email
     * @param otp OTP code
     * @param newPassword New password
     */
    async resetPassword(email: string, otp: string, newPassword: string): Promise<boolean> {
        try {
            const player = await PlayerRepository.findByEmail(email);
            if (!player) {
                throw new Error("Player not found");
            }

            // Verify OTP
            const isValid = await OTPService.verifyPasswordResetOTP(player.id.toString(), otp);
            if (!isValid) {
                throw new Error("Invalid or expired reset code");
            }

            // Update player's password
            await PlayerRepository.updatePassword(player.id.toString(), newPassword);

            // Send password reset success email
            const loginURL = `${config.FRONTEND_URL}/login`;
            await EmailService.sendPasswordResetSuccessEmail(player, loginURL);

            logger.info(`Password reset successfully for: ${player.email}`);

            return true;
        } catch (error: any) {
            logger.error(`Error in resetPassword: ${error.message}`);
            throw error;
        }
    }

    /**
     * Generate OTP for two-factor authentication
     * @param playerId Player ID
     */
    async generateTwoFactorOTP(playerId: string): Promise<string> {
        try {
            const player = await PlayerRepository.findById(playerId);
            if (!player) {
                throw new Error("Player not found");
            }

            // Generate and send login verification OTP
            const otp = await OTPService.generateLoginVerificationOTP(player);

            logger.info(`Two-factor OTP generated for player: ${player.email}`);

            return otp;
        } catch (error: any) {
            logger.error(`Error in generateTwoFactorOTP: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify two-factor authentication OTP
     * @param playerId Player ID
     * @param otp OTP code
     */
    async verifyTwoFactorOTP(playerId: string, otp: string): Promise<boolean> {
        try {
            return await OTPService.verifyLoginOTP(playerId, otp);
        } catch (error: any) {
            logger.error(`Error in verifyTwoFactorOTP: ${error.message}`);
            throw error;
        }
    }

    /**
     * Validate jersey number uniqueness within a university
     * @param universityId University ID
     * @param jerseyNumber Jersey number to validate
     */
    async validateJerseyNumber(universityId: string, jerseyNumber: number): Promise<boolean> {
        try {
            const existingPlayer = await PlayerRepository.findByUniversityAndJerseyNumber(
                universityId,
                jerseyNumber
            );
            return !existingPlayer; // Return true if jersey number is available
        } catch (error: any) {
            logger.error(`Error in validateJerseyNumber: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create new team
     * @param playerId Player ID
     * @param teamData Team creation data
     */
    async createTeam(playerId: string, teamData: any): Promise<any> {
        try {
            const player = await PlayerRepository.findById(playerId);
            if (!player) {
                throw new Error("Player not found");
            }

            // Ensure player has completed their profile
            if (player.registrationStatus !== "completed") {
                throw new Error("Please complete your profile before creating a team");
            }

            // Set the captain to the current player
            teamData.captainId = player._id;

            // Set university to player's university
            if (!player.universityId) {
                throw new Error("Player must be associated with a university to create a team");
            }
            teamData.universityId = player.universityId;

            // Create team
            const team = new TeamModel(teamData);
            await team.save();

            // Send team creation confirmation email
            const teamDashboardURL = `${config.FRONTEND_URL}/teams/${team._id}`;
            await EmailService.sendTeamCreationEmail(player, team, teamDashboardURL);

            logger.info(`Team created by player: ${player.email}`);

            return team;
        } catch (error: any) {
            logger.error(`Error in createTeam: ${error.message}`);
            throw error;
        }
    }

    /**
     * Join team
     * @param playerId Player ID
     * @param teamId Team ID
     * @param role Player role in the team
     */
    async joinTeam(playerId: string, teamId: string, role: PlayerRole): Promise<boolean> {
        try {
            // This would require TeamPlayer repository implementation
            logger.info(`Player ${playerId} joining team ${teamId} as ${role}`);
            return true;
        } catch (error: any) {
            logger.error(`Error in joinTeam: ${error.message}`);
            throw error;
        }
    }

    /**
     * Deactivate player
     * @param playerId Player ID
     */
    async deactivatePlayer(playerId: string): Promise<IPlayer | null> {
        try {
            // Invalidate all OTPs for this player
            await OTPService.invalidateAllOTPs(playerId);

            // Deactivate account
            return await PlayerRepository.setActiveStatus(playerId, false);
        } catch (error: any) {
            logger.error(`Error in deactivatePlayer: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get player by ID
     * @param id Player ID
     */
    async getPlayerById(id: string): Promise<IPlayer | null> {
        try {
            return await PlayerRepository.findById(id);
        } catch (error: any) {
            logger.error(`Error in getPlayerById: ${error.message}`);
            throw error;
        }
    }

    /**
     * Change password
     * @param playerId Player ID
     * @param currentPassword Current password
     * @param newPassword New password
     */
    async changePassword(playerId: string, currentPassword: string, newPassword: string): Promise<boolean> {
        try {
            // First get the player without password
            const playerBasic = await PlayerRepository.findById(playerId);
            if (!playerBasic) {
                throw new Error("Player not found");
            }

            // Then get player with password separately
            const player = await PlayerRepository.findByIdWithPassword(playerId);
            if (!player) {
                throw new Error("Player not found");
            }

            // Verify current password
            const isMatch = await player.comparePassword(currentPassword);
            if (!isMatch) {
                throw new Error("Current password is incorrect");
            }

            // Update password
            await PlayerRepository.updatePassword(playerId, newPassword);

            // Invalidate all password reset OTPs
            await OTPService.invalidateAllOTPs(playerId);

            return true;
        } catch (error: any) {
            logger.error(`Error in changePassword: ${error.message}`);
            throw error;
        }
    }

    /**
     * Update player details with additional validation for jersey number
     * @param playerId Player ID
     * @param updateData Update data
     */
    async updatePlayer(playerId: string, updateData: Partial<IPlayer>): Promise<IPlayer | null> {
        try {
            const player = await PlayerRepository.findById(playerId);
            if (!player) {
                throw new Error("Player not found");
            }

            // Validate jersey number if provided
            if (updateData.jerseyNumber !== undefined && updateData.universityId) {
                const isJerseyNumberAvailable = await this.validateJerseyNumber(
                    updateData.universityId.toString(),
                    updateData.jerseyNumber
                );
                if (!isJerseyNumberAvailable) {
                    throw new Error("Jersey number is already taken within this university");
                }
            }

            // If jerseyNumber and universityId are provided, validate even if unchanged
            if (updateData.jerseyNumber && player.universityId) {
                const isJerseyNumberAvailable = await this.validateJerseyNumber(
                    player.universityId.toString(),
                    updateData.jerseyNumber
                );
                if (!isJerseyNumberAvailable) {
                    throw new Error("Jersey number is already taken within this university");
                }
            }

            const updatedPlayer = await PlayerRepository.update(playerId, updateData);

            // Check if all required fields are now provided to mark registration as completed
            if (
                updatedPlayer?.age !== undefined &&
                updatedPlayer?.universityId &&
                updatedPlayer?.jerseyNumber !== undefined &&
                updatedPlayer?.phone
            ) {
                updatedPlayer.registrationStatus = <RegistrationStatus>"completed";
                await updatedPlayer.save();
            }

            return updatedPlayer;
        } catch (error: any) {
            logger.error(`Error in updatePlayer: ${error.message}`);
            throw error;
        }
    }
}

export default new PlayerService();