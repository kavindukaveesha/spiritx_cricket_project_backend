import dotenv from 'dotenv';

dotenv.config();

interface Config {
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  NODE_ENV: string;
  MAILTRAP_ENDPOINT: string;
  MAILTRAP_TOKEN: string;
  EMAIL_FROM: string;
  EMAIL_FROM_NAME: string;
  FRONTEND_URL: string;
}

const config: Config = {
  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ts-backend',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MAILTRAP_ENDPOINT: process.env.MAILTRAP_ENDPOINT || 'https://send.api.mailtrap.io/',
  MAILTRAP_TOKEN: process.env.MAILTRAP_TOKEN || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@crickettournament.com',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Cricket Tournament',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

};

export default config;