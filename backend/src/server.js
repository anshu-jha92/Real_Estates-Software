import 'dotenv/config';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import socialMeta from './middleware/socialMeta.js';

const app = express();
const PORT = process.env.PORT || 5000;
// CLIENT_URL may list several origins, comma separated — e.g. localhost plus your LAN
// IP so a phone on the same Wi-Fi can open the site. Passing the raw string to cors()
// emits one header holding both values, which every browser rejects. Split it instead.
// A trailing slash never matches a browser Origin header either, so strip it.
const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);
// Render injects its own public URL; allowing it means the deployed site never
// needs CLIENT_URL set by hand just to talk to its own API.
if (process.env.RENDER_EXTERNAL_URL) CLIENT_URL.push(process.env.RENDER_EXTERNAL_URL.replace(/\/+$/, ''));

// When the frontend has been built (Render runs `vite build` before starting
// us), this one process serves it too: one URL, same origin, no CORS at all.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIST = path.resolve(__dirname, '../../frontend/dist');
const SERVE_FRONTEND = existsSync(path.join(FRONTEND_DIST, 'index.html'));

// Behind one proxy (Render/Nginx) so req.ip is the real client for rate limiting.
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.use('/api', routes);

if (SERVE_FRONTEND) {
  // Hashed assets can be cached for a year; index.html must always be fresh so
  // a new deploy is picked up on the next visit.
  app.use(
    express.static(FRONTEND_DIST, {
      index: false,
      maxAge: '1y',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
      },
    })
  );
  // Read once: a deploy restarts the process, so the file cannot go stale.
  const INDEX_HTML = readFileSync(path.join(FRONTEND_DIST, 'index.html'), 'utf8');

  // Client-side routes (/properties, /property/:slug, /admin/...) all boot from index.html.
  app.get(/^(?!\/api(\/|$)).*/, async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    // Property and blog pages leave with their own og: tags, so a link shared
    // on WhatsApp shows that listing's photo instead of the site default.
    res.type('html').send(await socialMeta(INDEX_HTML, req));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Rama Kripa Estates API. See /api/health.',
      docs: '/api/health',
    });
  });
}

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
  } catch (err) {
    // Keep serving: /api/health answers, other routes return a clean 503 so the
    // frontend still boots and shows its empty states.
    console.warn('\n[warn] Could not connect to MongoDB:', err.message);
    console.warn('[warn] Check MONGO_URI in backend/.env (local mongod running, or Atlas IP whitelisted).');
    console.warn('[warn] The API will keep running and retry on the next request.\n');
  }

  const server = app.listen(PORT, () => {
    console.log(`[api] Rama Kripa Estates API listening on http://localhost:${PORT}`);
    console.log(`[api] Health check:  http://localhost:${PORT}/api/health`);
    console.log(`[api] CORS origins:  ${CLIENT_URL.join(', ')}`);
    console.log(`[api] Frontend:      ${SERVE_FRONTEND ? `serving ${FRONTEND_DIST}` : 'not built — API only'}`);
  });

  // Almost always a second copy of this server left running in another terminal.
  // The default stack trace buries that, so say it plainly and exit quietly.
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[api] Port ${PORT} is already in use — the API is probably running in another terminal.`);
      console.error('[api] Close it, or free the port:');
      console.error(`[api]   Windows   npx kill-port ${PORT}`);
      console.error(`[api]   Mac/Linux lsof -ti:${PORT} | xargs kill -9`);
      console.error(`[api] Or start on a different port:  PORT=5001 npm run dev\n`);
      process.exit(1);
    }
    throw err;
  });
};

start();

process.on('unhandledRejection', (err) => {
  console.error('[fatal] Unhandled rejection:', err?.message || err);
});

export default app;
