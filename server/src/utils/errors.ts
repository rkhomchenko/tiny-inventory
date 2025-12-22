export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: unknown) {
    super(message, 404, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, 400, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists', details?: unknown) {
    super(message, 409, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: unknown) {
    super(message, 500, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details?: unknown) {
    super(message, 401, details);
  }
}
