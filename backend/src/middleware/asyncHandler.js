/**
 * Wraps an async controller so rejected promises reach the central errorHandler
 * instead of hanging the request.
 *   router.get('/', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
