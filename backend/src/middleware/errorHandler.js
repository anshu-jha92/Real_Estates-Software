/** 404 for any unmatched route. Runs before errorHandler. */
export const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

/**
 * Central error handler. Turns Mongoose/JWT errors into clean JSON:
 *   { success:false, message, errors? }
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Something went wrong. Please try again.';
  // AppError (thrown by the service layer) carries its own field map.
  let errors = err.name === 'AppError' ? err.errors : undefined;

  // Bad ObjectId / bad number in a query -> 400 with a readable message.
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value "${err.value}" for field "${err.path}".`;
  }

  // Schema validation -> 400 with a field:message map.
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    errors = Object.fromEntries(Object.entries(err.errors).map(([field, e]) => [field, e.message]));
    message = 'Please correct the highlighted fields.';
  }

  // Duplicate key (unique index) -> 400 naming the field.
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    const value = err.keyValue ? err.keyValue[field] : '';
    errors = { [field]: `"${value}" already exists.` };
    message = `A record with that ${field} already exists.`;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid session token. Please sign in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please sign in again.';
  }

  // Mongo is unreachable / the driver buffered a query until timeout.
  if (err.name === 'MongooseServerSelectionError' || /buffering timed out/i.test(message)) {
    statusCode = 503;
    message = 'The database is unavailable right now. Please try again in a moment.';
  }

  if (statusCode >= 500) console.error('[error]', err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
};

export default errorHandler;
