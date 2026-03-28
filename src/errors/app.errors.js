class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}


class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}


class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}


class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}


class MethodNotAllowedError extends AppError {
  constructor(message = "Method Not Allowed") {
    super(message, 405);
  }
}


class RequestTimeoutError extends AppError {
  constructor(message = "Request Timeout") {
    super(message, 408);
  }
}

class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = "Too Many Requests") {
    super(message, 429);
  }
}

class InternalServerError extends AppError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
  }
}

class NotImplementedError extends AppError {
  constructor(message = "Not Implemented") {
    super(message, 501);
  }
}

class BadGatewayError extends AppError {
  constructor(message = "Bad Gateway") {
    super(message, 502);
  }
}

class ServiceUnavailableError extends AppError {
  constructor(message = "Service Unavailable") {
    super(message, 503);
  }
}

class GatewayTimeoutError extends AppError {
  constructor(message = "Gateway Timeout") {
    super(message, 504);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  MethodNotAllowedError,
  RequestTimeoutError,
  ConflictError,
  TooManyRequestsError,
  InternalServerError,
  NotImplementedError,
  BadGatewayError,
  ServiceUnavailableError,
  GatewayTimeoutError,
};