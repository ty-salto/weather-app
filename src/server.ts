console.log("Hello via Bun!");

import { Hono } from "hono";
import { serveStatic } from "hono/bun";

const app = new Hono();

// ✅ Serve dist CSS (Tailwind output)
app.use('/dist/*', serveStatic({ root: './dist' }));

// Serve static assets (css, scripts, images, etc.)
app.use('/*', serveStatic({ root: './public' }));

// serve index for root "/"
app.get("/", serveStatic({ path: './pages/index.html'}))


Bun.serve({
    port: 3000,                   // Specify your desired port
    hostname: '127.0.0.1',          // Optional: specify the hostname explicitly
    fetch: app.fetch,
    error(error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  });