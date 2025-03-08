import OTPRepository from '../repositories/otp.repository';
import EmailService from './email.service';
import { OTPType } from '../models/otp.model';
import { IPlayer } from '../models';
import config from '../config/environment';
import logger from '../utils/logger';
import PlayerRepository from "../repositories/player.repository";

class OTPService {
    /**
     * Generate and send OTP for account verification
     * @param player Player to verify
     */
    async generateVerificationOTP(player: IPlayer): Promise<string> {
        try {
            // Generate OTP
            const otp = await OTPRepository.create(
                player.id.toString(),
                player.email,
                OTPType.ACCOUNT_VERIFICATION,
                30 // 30 minutes expiration
            );

            // Send email with OTP
            let isSent = await EmailService.sendVerificationEmail(player, otp.code);
            if (!isSent) {
                logger.info(`Verification OTP sent to ${player.email}`);
            }else{
                logger.info(`Error in OTP sent to ${player.email}`);

            }



            return otp.code;
        } catch (error) {
            logger.error(`Error generating verification OTP: ${error}`);
            throw error;
        }
    }

    /**
     * Generate and send OTP for password reset
     * @param player Player requesting password reset
     */
    async generatePasswordResetOTP(player: IPlayer): Promise<string> {
        try {
            // Generate OTP
            const otp = await OTPRepository.create(
                player.id.toString(),
                player.email,
                OTPType.PASSWORD_RESET,
                60 // 60 minutes expiration
            );

            // Create reset URL (for email template)
            const resetURL = `${config.FRONTEND_URL}/reset-password?email=${encodeURIComponent(player.email)}&otp=${otp.code}`;

            // Send email with reset link
            let isSent   = await EmailService.sendPasswordResetEmail(player, resetURL);
            if(!isSent){
                logger.info(`Error in OTP sent to ${player.email}`);
                return 'error';
            }
            logger.info(`successfully  OTP sent to ${player.email}`);
            return otp.code;

        } catch (error) {
            logger.error(`Error generating password reset OTP: ${error}`);
            throw error;
        }
    }

    /**
     * Generate and send OTP for login verification (2FA)
     * @param player Player to verify
     */
    async generateLoginVerificationOTP(player: IPlayer): Promise<string> {
        try {
            // Generate OTP
            const otp = await OTPRepository.create(
                player.id.toString(),
                player.email,
                OTPType.LOGIN_VERIFICATION,
                15 // 15 minutes expiration
            );

            // In a real app, you would send this via SMS or email
            // For now, we'll use email
            const subject = 'Your Login Verification Code';
            const htmlContent = `
        <p>Hello ${player.firstName},</p>
        <p>Your login verification code is: <strong>${otp.code}</strong></p>
        <p>This code will expire in 15 minutes.</p>
      `;

            await EmailService.sendCustomEmail(player.email, subject, htmlContent, 'Login Verification');

            logger.info(`Login verification OTP sent to ${player.email}`);

            return otp.code;
        } catch (error) {
            logger.error(`Error generating login verification OTP: ${error}`);
            throw error;
        }
    }

    /**
     * Verify OTP for account verification
     * @param playerId Player ID
     * @param code OTP code
     */
    async verifyAccountOTP(playerId: string, code: string): Promise<boolean> {
        try {
            return await OTPRepository.verify(playerId, code, OTPType.ACCOUNT_VERIFICATION);
        } catch (error) {
            logger.error(`Error verifying account OTP: ${error}`);
            throw error;
        }
    }

    /**
     * Verify OTP for password reset
     * @param playerId Player ID
     * @param code OTP code
     */
    async verifyPasswordResetOTP(playerId: string, code: string): Promise<boolean> {
        try {
            return await OTPRepository.verify(playerId, code, OTPType.PASSWORD_RESET);
        } catch (error) {
            logger.error(`Error verifying password reset OTP: ${error}`);
            throw error;
        }
    }

    /**
     * Verify OTP for login verification (2FA)
     * @param playerId Player ID
     * @param code OTP code
     */
    async verifyLoginOTP(playerId: string, code: string): Promise<boolean> {
        try {
            return await OTPRepository.verify(playerId, code, OTPType.LOGIN_VERIFICATION);
        } catch (error) {
            logger.error(`Error verifying login OTP: ${error}`);
            throw error;
        }
    }

    /**
     * Invalidate all OTPs for a player
     * @param playerId Player ID
     */
    async invalidateAllOTPs(playerId: string): Promise<void> {
        try {
            const player = await PlayerRepository.findById(playerId);
            if (!player) {
                throw new Error('Player not found');
            }

            // Invalidate all types of OTPs
            for (const type of Object.values(OTPType)) {
                await OTPRepository.invalidateExistingOTPs(playerId, player.email, type as OTPType);
            }

            logger.info(`All OTPs invalidated for player ${playerId}`);
        } catch (error) {
            logger.error(`Error invalidating all OTPs: ${error}`);
            throw error;
        }
    }
}

export default new OTPService();