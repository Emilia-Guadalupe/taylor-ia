/**
 * Vercel serverless entry point. Vercel treats any file under /api as a
 * function; this one just re-exports the Express app from server.js, which
 * Vercel's Node runtime can call directly as a (req, res) handler.
 */
import app from "../server.js";

export default app;
