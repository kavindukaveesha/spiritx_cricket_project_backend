
class BaseError extends Error {
    statusCode: number;
    details?: any;

    constructor(message: string, statusCode: number, details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends BaseError {
    constructor(message: string, details?: any) {
        super(message, 404, details);
    }
}

export class UnauthorizedError extends BaseError {
    constructor(message: string, details?: any) {
        super(message, 403, details);
    }
}

export class ValidationError extends BaseError {
    constructor(message: string, details?: any) {
        super(message, 400, details);
    }
}

export class ConflictError extends BaseError {
    constructor(message: string, details?: any) {
        super(message, 409, details);
    }
}

export class InternalServerError extends BaseError {
    constructor(message: string, details?: any) {
        super(message, 500, details);
    }
}

export class ServiceUnavailableError extends BaseError {
    constructor(message: string, details?: any) {
        super(message, 503, details);
    }
}