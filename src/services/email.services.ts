import { mailtrapClient, sender, validateMailtrapConfig } from '../config/mailtrap.config';
import {
    VERIFICATION_EMAIL_TEMPLATE,
    WELCOME_EMAIL_TEMPLATE,
    PASSWORD_RESET_REQUEST_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE,
    TEAM_CREATION_TEMPLATE,
    MATCH_SCHEDULED_TEMPLATE,
    TEAM_INVITATION_TEMPLATE
} from '../utils/email-templates';
import config from '../config/environment';
import logger from '../utils/logger';
import { IPlayer, ITeam, IMatch } from '../models';

// Initialize the email service configuration
const isEmailConfigValid = validateMailtrapConfig();

class EmailService {
    /**
     * Send player account verification email
     * @param player Player information
     * @param verificationCode Verification code or token
     */
    async sendVerificationEmail(player: IPlayer, verificationCode: string): Promise<boolean> {
        if (!isEmailConfigValid) {
            logger.warn(`Email service not configured. Would have sent verification email to ${player.email}`);
            return false;
        }

        try {
            // Replace template variables
            const htmlContent = VERIFICATION_EMAIL_TEMPLATE
                .replace('{playerName}', `${player.firstName} ${player.lastName}`)
                .replace('{verificationCode}', verificationCode);

            // Define recipient
            const recipient = [{ email: player.email }];

            // Send email
            const response = await mailtrapClient.send({
                from: sender,
                to: recipient,
                subject: 'Verify Your Cricket Tournament Account',
                html: htmlContent,
                category: 'Account Verification'
            });

            logger.info(`Verification email sent to ${player.email}`);
            return true;
        } catch (error: any) {
            logger.error(`Error sending verification email to ${player.email}: ${error.message}`);
            return false;
        }
    }

    /**
     * Send welcome email after account verification
     * @param player Player information
     * @param dashboardURL URL to the player dashboard
     */
    async sendWelcomeEmail(player: IPlayer, dashboardURL: string): Promise<boolean> {
        if (!isEmailConfigValid) {
            logger.warn(`Email service not configured. Would have sent welcome email to ${player.email}`);
            return false;
        }

        try {
            // Get university name (if available)
            const universityName = player.universityId ? 'Your University' : 'Not specified';

            // Replace template variables
            const htmlContent = WELCOME_EMAIL_TEMPLATE
                .replace('{playerName}', `${player.firstName} ${player.lastName}`)
                .replace('{playerId}', player.playerId)
                .replace('{universityName}', universityName)
                .replace('{playerEmail}', player.email)
                .replace('{dashboardURL}', dashboardURL);

            // Define recipient
            const recipient = [{ email: player.email }];

            // Send email
            const response = await mailtrapClient.send({
                from: sender,
                to: recipient,
                subject: 'Welcome to Cricket Tournament',
                html: htmlContent,
                category: 'Welcome'
            });

            logger.info(`Welcome email sent to ${player.email}`);
            return true;
        } catch (error: any) {
            logger.error(`Error sending welcome email to ${player.email}: ${error.message}`);
            return false;
        }
    }

    /**
     * Send password reset request email
     * @param player Player information
     * @param resetURL Password reset URL
     */
    async sendPasswordResetEmail(player: IPlayer, resetURL: string): Promise<boolean> {
        if (!isEmailConfigValid) {
            logger.warn(`Email service not configured. Would have sent password reset email to ${player.email}`);
            return false;
        }

        try {
            // Replace template variables
            const htmlContent = PASSWORD_RESET_REQUEST_TEMPLATE
                .replace(/{playerName}/g, `${player.firstName} ${player.lastName}`)
                .replace(/{resetURL}/g, resetURL);

            // Define recipient
            const recipient = [{ email: player.email }];

            // Send email
            const response = await mailtrapClient.send({
                from: sender,
                to: recipient,
                subject: 'Reset Your Cricket Tournament Password',
                html: htmlContent,
                category: 'Password Reset'
            });

            logger.info(`Password reset email sent to ${player.email}`);
            return true;
        } catch (error: any) {
            logger.error(`Error sending password reset email to ${player.email}: ${error.message}`);
            return false;
        }
    }

    /**
     * Send password reset success confirmation
     * @param player Player information
     * @param loginURL Login URL
     */
    async sendPasswordResetSuccessEmail(player: IPlayer, loginURL: string): Promise<boolean> {
        if (!isEmailConfigValid) {
            logger.warn(`Email service not configured. Would have sent password reset success email to ${player.email}`);
            return false;
        }

        try {
            // Replace template variables
            const htmlContent = PASSWORD_RESET_SUCCESS_TEMPLATE
                .replace('{playerName}', `${player.firstName} ${player.lastName}`)
                .replace('{loginURL}', loginURL);

            // Define recipient
            const recipient = [{ email: player.email }];

            // Send email
            const response = await mailtrapClient.send({
                from: sender,
                to: recipient,
                subject: 'Your Cricket Tournament Password Has Been Reset',
                html: htmlContent,
                category: 'Password Reset'
            });

            logger.info(`Password reset success email sent to ${player.email}`);
            return true;
        } catch (error: any) {
            logger.error(`Error sending password reset success email to ${player.email}: ${error.message}`);
            return false;
        }
    }

    /**
     * Send team creation confirmation to captain
     * @param captain Team captain information
     * @param team Team information
     * @param teamDashboardURL Team dashboard URL
     */
    async sendTeamCreationEmail(captain: IPlayer, team: ITeam, teamDashboardURL: string): Promise<boolean> {
        if (!isEmailConfigValid) {
            logger.warn(`Email service not configured. Would have sent team creation email to ${captain.email}`);
            return false;
        }

        try {
            // Get university name (if available)
            const universityName = team.universityId ? 'Your University' : 'Not specified';

            // Replace template variables
            const htmlContent = TEAM_CREATION_TEMPLATE
                .replace('{captainName}', `${captain.firstName} ${captain.lastName}`)
                .replace(/{teamName}/g, team.name)
                .replace('{universityName}', universityName)
                .replace('{budget}', `$${team.budget.toFixed(2)}`)
                .replace('{teamDashboardURL}', teamDashboardURL);

            // Define recipient
            const recipient = [{ email: captain.email }];

            // Send email
            const response = await mailtrapClient.send({
                from: sender,
                to: recipient,
                subject: `Your Team "${team.name}" Has Been Created`,
                html: htmlContent,
                category: 'Team Management'
            });

            logger.info(`Team creation email sent to ${captain.email}`);
            return true;
        } catch (error: any) {
            logger.error(`Error sending team creation email to ${captain.email}: ${error.message}`);
            return false;
        }
    }

    /**
     * Send match schedule notification to players
     * @param player Player information
     * @param team Player's team
     * @param match Match information
     * @param matchDetailsURL Match details URL
     */
    async sendMatchScheduledEmail(
        player: IPlayer,
        team: ITeam,
        match: IMatch,
        matchDetailsURL: string
    ): Promise<boolean> {
        if (!isEmailConfigValid) {
            logger.warn(`Email service not configured. Would have sent match schedule email to ${player.email}`);
            return false;
        }

        try {
            // Format date and time
            const matchDate = new Date(match.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Determine team names
            const team1Name = match.team1Id.toString() === team.id.toString() ? team.name : 'Opponent Team';
            const team2Name = match.team2Id.toString() === team.id.toString() ? team.name : 'Opponent Team';

            // Format match format
            const matchFormat = `${match.matchFormat.totalOvers} Overs`;

            // Replace template variables
            const htmlContent = MATCH_SCHEDULED_TEMPLATE
                .replace('{playerName}', `${player.firstName} ${player.lastName}`)
                .replace('{teamName}', team.name)
                .replace('{matchTitle}', match.matchTitle)
                .replace('{team1Name}', team1Name)
                .replace('{team2Name}', team2Name)
                .replace('{matchDate}', matchDate)
                .replace('{matchTime}', match.time)
                .replace('{matchLocation}', match.location)
                .replace('{matchFormat}', matchFormat)
                .replace('{matchDetailsURL}', matchDetailsURL);

            // Define recipient
            const recipient = [{ email: player.email }];

            // Send email
            const response = await mailtrapClient.send({
                from: sender,
                to: recipient,
                subject: `Match Scheduled: ${team1Name} vs ${team2Name}`,
                html: htmlContent,
                category: 'Match Notification'
            });

            logger.info(`Match schedule email sent to ${player.email}`);
            return true;
        } catch (error: any) {
            logger.error(`Error sending match schedule email to ${player.email}: ${error.message}`);
            return false;
        }
    }

    /**
     * Send team invitation email to player
     * @param invitedPlayer Player being invited
     * @param captain Team captain
     * @param team Team information
     * @param playerRole Proposed role for the player
     * @param acceptInvitationURL URL to accept invitation
     */
    async sendTeamInvitationEmail(
        invitedPlayer: IPlayer,
        captain: IPlayer,
        team: ITeam,
        playerRole: string,
        acceptInvitationURL: string
    ): Promise<boolean> {
        if (!isEmailConfigValid) {
            logger.warn(`Email service not configured. Would have sent team invitation email to ${invitedPlayer.email}`);
            return false;
        }

        try {
            // Get university name (if available)
            const universityName = team.universityId ? 'Your University' : 'Not specified';

            // Replace template variables
            const htmlContent = TEAM_INVITATION_TEMPLATE
                .replace('{playerName}', `${invitedPlayer.firstName} ${invitedPlayer.lastName}`)
                .replace('{captainName}', `${captain.firstName} ${captain.lastName}`)
                .replace(/{teamName}/g, team.name)
                .replace('{universityName}', universityName)
                .replace('{playerRole}', playerRole)
                .replace('{acceptInvitationURL}', acceptInvitationURL);

            // Define recipient
            const recipient = [{ email: invitedPlayer.email }];

            // Send email
            const response = await mailtrapClient.send({
                from: sender,
                to: recipient,
                subject: `Invitation to Join Cricket Team: ${team.name}`,
                html: htmlContent,
                category: 'Team Invitation'
            });

            logger.info(`Team invitation email sent to ${invitedPlayer.email}`);
            return true;
        } catch (error: any) {
            logger.error(`Error sending team invitation email to ${invitedPlayer.email}: ${error.message}`);
            return false;
        }
    }

    /**
     * Send custom email
     * @param to Recipient email or array of emails
     * @param subject Email subject
     * @param htmlContent HTML content
     * @param category Email category for tracking
     */
    async sendCustomEmail(
        to: string | string[] | { email: string; name?: string }[],
        subject: string,
        htmlContent: string,
        category: string = 'General'
    ): Promise<boolean> {
        if (!isEmailConfigValid) {
            logger.warn(`Email service not configured. Would have sent custom email`);
            return false;
        }

        try {
            // Format recipients
            let recipients;
            if (typeof to === 'string') {
                recipients = [{ email: to }];
            } else if (Array.isArray(to) && typeof to[0] === 'string') {
                recipients = (to as string[]).map(email => ({ email }));
            } else {
                recipients = to;
            }

            // Send email
            const response = await mailtrapClient.send({
                from: sender,
                to: recipients as { email: string; name?: string }[],
                subject,
                html: htmlContent,
                category
            });

            logger.info(`Custom email sent to ${recipients.length} recipients`);
            return true;
        } catch (error: any) {
            logger.error(`Error sending custom email: ${error.message}`);
            return false;
        }
    }
}

export default new EmailService();