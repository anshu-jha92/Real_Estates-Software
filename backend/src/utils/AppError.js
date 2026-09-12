/**
 * The error type services throw.
 *
 * Services must not import express or touch `res`, so they signal failure by
 * throwing one of these. `errorHandler` reads `statusCode` and `errors` and
 * renders the JSON body, exactly as it already does for Mongoose errors.
 */
export class AppError extends Error {
  constructor(message, statusCode = 400, errors) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    if (errors) this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace?.(this, AppError);
  }
}

export const badRequest = (message, errors) => new AppError(message, 400, errors);
export const unauthorized = (message = 'Please sign in to continue.') => new AppError(message, 401);
export const forbidden = (message = 'You do not have access to this.') => new AppError(message, 403);
export const notFound = (message = 'Not found.') => new AppError(message, 404);

export default AppError;
