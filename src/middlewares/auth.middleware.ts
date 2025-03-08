import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/environment";
import PlayerRepository from "../repositories/player.repository";
// import TeamRepository from "../repositories/t";
import JwtTokenService from "../services/jwt-token.service";
import logger from "../utils/logger";

// Interface for JWT payload
interface TokenPayload {
    id: string; // Player ID (MongoDB _id)
    email: string;
    role?: "admin" | "player" | "captain"; // Define roles explicitly
    iat?: number; // Issued at
    exp?: number; // Expiration
    [key: string]: any; // Allow additional fields
}

// Extend Express Request interface to include user field
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

// Type for environment config
interface EnvironmentConfig {
    jwtSecret: string;
    [key: string]: any;
}

// Ensure config is typed
const envConfig = config as unknown as EnvironmentConfig;

/**
 * Authentication middleware to verify JWT token
 */
export const authenticateJWT = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        // Check if token exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            logger.warn("Authentication failed: No token provided");
            res.status(401).json({
                success: false,
                message: "Authentication failed: No token provided",
            });
            return;
        }

        // Extract the token
        const token = authHeader.split(" ")[1];

        try {
            // Verify the token
            const decoded = JwtTokenService.verifyAccessToken(token) as TokenPayload;

            // Add user data to request
            req.user = decoded;

            // Check if token is in database and not revoked
            const tokenRecord = await JwtTokenService.isTokenValid(token);
            if (!tokenRecord) {
                logger.warn(`Authentication failed: Token revoked or invalid - ${token}`);
                res.status(401).json({
                    success: false,
                    message: "Authentication failed: Token is invalid or revoked",
                });
                return;
            }

            // Check if player exists and is active
            const player = await PlayerRepository.findById(decoded.id);
            if (!player) {
                logger.warn(`Authentication failed: Player not found - ID: ${decoded.id}`);
                res.status(401).json({
                    success: false,
                    message: "Authentication failed: Player not found",
                });
                return;
            }

            // Check if player account is active
            if (!player.isActive) {
                logger.warn(`Authentication failed: Player account deactivated - ID: ${decoded.id}`);
                res.status(401).json({
                    success: false,
                    message: "Authentication failed: Player account is deactivated",
                });
                return;
            }

            // Optionally, check if player is verified (if your app requires it)
            if (!player.isVerified) {
                logger.warn(`Authentication failed: Player account not verified - ID: ${decoded.id}`);
                res.status(401).json({
                    success: false,
                    message: "Authentication failed: Player account is not verified",
                });
                return;
            }

            next();
        } catch (error: any) {
            logger.error(`JWT Verification Error: ${error.message}`);
            res.status(401).json({
                success: false,
                message: "Authentication failed: Invalid token",
            });
        }
    } catch (error: any) {
        logger.error(`Authentication Error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error during authentication",
        });
    }
};

/**
 * Admin role authorization middleware
 */
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Check if user is authenticated and has admin role
        if (!req.user) {
            logger.warn("Authorization failed: No user in request");
            res.status(401).json({
                success: false,
                message: "Authorization failed: User not authenticated",
            });
            return;
        }

        if (req.user.role !== "admin") {
            logger.warn(`Authorization failed: Admin role required - User: ${req.user.id}`);
            res.status(403).json({
                success: false,
                message: "Access denied: Admin role required",
            });
            return;
        }

        next();
    } catch (error: any) {
        logger.error(`Admin Authorization Error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error during admin authorization",
        });
    }
};

/**
 * Captain role authorization middleware
 */
export const authorizeCaptain = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            logger.warn("Authorization failed: No user in request");
            res.status(401).json({
                success: false,
                message: "Authorization failed: User not authenticated",
            });
            return;
        }

        // Get team ID from parameters or body
        const teamId = req.params.teamId || req.body.teamId;

        if (!teamId) {
            logger.warn("Authorization failed: Team ID is required");
            res.status(400).json({
                success: false,
                message: "Team ID is required",
            });
            return;
        }

        // Fetch the team to verify captain
        // const team = await TeamRepository.getTeamById(teamId);
        // if (!team) {
        //     logger.warn(`Authorization failed: Team not found - Team ID: ${teamId}`);
        //     res.status(404).json({
        //         success: false,
        //         message: "Team not found",
        //     });
        //     return;
        // }

        // // Check if the player is the captain of the team
        // const isCaptain = team.captainId.toString() === req.user.id;

        // if (!isCaptain) {
        //     logger.warn(`Authorization failed: User is not the captain - User: ${req.user.id}, Team: ${teamId}`);
        //     res.status(403).json({
        //         success: false,
        //         message: "Access denied: Team captain role required",
        //     });
        //     return;
        // }

        next();
    } catch (error: any) {
        logger.error(`Captain Authorization Error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error during captain authorization",
        });
    }
};

/**
 * Player role authorization middleware (for general player access)
 */
export const authorizePlayer = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Check if user is authenticated and has player or captain role
        if (!req.user) {
            logger.warn("Authorization failed: No user in request");
            res.status(401).json({
                success: false,
                message: "Authorization failed: User not authenticated",
            });
            return;
        }

        if (req.user.role !== "player" && req.user.role !== "captain") {
            logger.warn(`Authorization failed: Player or Captain role required - User: ${req.user.id}`);
            res.status(403).json({
                success: false,
                message: "Access denied: Player or Captain role required",
            });
            return;
        }

        next();
    } catch (error: any) {
        logger.error(`Player Authorization Error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error during player authorization",
        });
    }
};