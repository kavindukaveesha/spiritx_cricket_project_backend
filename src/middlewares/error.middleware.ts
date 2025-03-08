import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import logger from '../utils/logger';

// Interface for custom error
interface CustomError extends Error {
    statusCode?: number;
    code?: number;
    keyValue?: Record<string, any>;
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Server Error';

    // Log the error
    logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    // Handle Mongoose validation errors
    if (err instanceof MongooseError.ValidationError) {
        statusCode = 400;
        const errors: Record<string, string> = {};

        Object.keys(err.errors).forEach((key) => {
            errors[key] = err.errors[key].message;
        });

        res.status(statusCode).json({
            success: false,
            message: 'Validation Error',
            errors
        });
        return;
    }

    // Handle Mongoose duplicate key errors
    if (err.code === 11000 && err.keyValue) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate field value: ${field}. Please use another value!`;
    }

    // Handle Mongoose cast errors (e.g., invalid ObjectId)
    if (err instanceof MongooseError.CastError) {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Send response
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};