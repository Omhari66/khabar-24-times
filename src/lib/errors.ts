export class AppError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: string,
    readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, "BAD_REQUEST", details);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: Record<string, unknown>) {
    super(message, 401, "UNAUTHORIZED", details);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: Record<string, unknown>) {
    super(message, 403, "FORBIDDEN", details);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not Found", details?: Record<string, unknown>) {
    super(message, 404, "NOT_FOUND", details);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 409, "CONFLICT", details);
    this.name = "ConflictError";
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal Server Error", details?: Record<string, unknown>) {
    super(message, 500, "INTERNAL_SERVER_ERROR", details);
    this.name = "InternalServerError";
  }
}
