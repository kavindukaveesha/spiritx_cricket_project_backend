import { MailtrapClient } from 'mailtrap';
import config from './environment';
import logger from '../utils/logger';


// Initialize Mailtrap client with the corrected configuration
export const mailtrapClient = new MailtrapClient({
    token: config.MAILTRAP_TOKEN || ''
});

// Default sender information
export const sender = {
    email: config.EMAIL_FROM || 'noreply@crickettournament.com',
    name: config.EMAIL_FROM_NAME || 'Cricket Tournament',
};

// Validate Mailtrap configuration on startup
export const validateMailtrapConfig = (): boolean => {
    if (!config.MAILTRAP_TOKEN) {
        logger.warn('Mailtrap token is not configured. Email sending will not work.');
        return false;
    }

    logger.info('Mailtrap configuration loaded successfully');
    return true;
};