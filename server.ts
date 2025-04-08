console.log("Hello via Bun!");

import { Hono } from "hono";
import { serveStatic } from "hono/bun";

const app = new Hono();

const API_KEY = Bun.env.OPENWEATHER_API_KEY;

// ✅ Serve dist CSS (Tailwind output)
app.use('/dist/*', serveStatic({ root: './' }));

// Serve static assets (css, scripts, images, etc.)
app.use('/public/*', serveStatic({ root: './' }));

// serve index for root "/"
app.get("/", serveStatic({ path: './pages/index.html'}))


// ✅ Handle weather POST request from form
app.post("/api/weather", async (c) => {
  try {
    const { city } = await c.req.json();

    if (!city) {
      return c.json({ code: 400, message: "City is required" });
    }

    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    const weatherData = await weatherRes.json();
    console.log(weatherData)
    return c.json(weatherData)
  } catch (err) {
    console.error("Weather fetch failed:", err);
    return c.json({ code: 500, message: "Internal server error" });
  }
});

app.post("/api/weathergeo", async (c) => {
  try {
    const { lat, lon } = await c.req.json();

    if (typeof lat !== "number" || typeof lon !== "number") {
      return c.json({ code: 400, message: "Latitude and Longitude are required" });
    }

    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    const weatherData = await weatherRes.json();

    console.log("✅ Weather data via geolocation:", weatherData);

    return c.json(weatherData);
  } catch (err) {
    console.error("Weather fetch (geo) failed:", err);
    return c.json({ code: 500, message: "Internal server error" });
  }
});

Bun.serve({
    port: Bun.env.PORT,                   // Specify your desired port
    fetch: app.fetch,
    error(error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  });
