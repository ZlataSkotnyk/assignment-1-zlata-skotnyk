import { HttpError } from '../lib/http-error.js';

// Express treats a middleware with four parameters as an error handler.
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // Handle errors that we created intentionally.
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        ...(err.details !== undefined && { details: err.details }),
      },
    });
  }

  // Unexpected errors are logged in the terminal.
  console.error(err);
  res.status(500).json({
    error: { message: 'Internal server error' },
  });
}