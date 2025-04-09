console.log("Hello via Bun!");

import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { serveStatic } from "hono/bun";

import countries from "./public/ts/data/country-code-pair.json";

const app = new Hono();

const API_KEY = Bun.env.OPENWEATHER_API_KEY;

// Serve dist CSS (Tailwind output)
app.use("/dist/*", serveStatic({ root: "./" }));

// Serve static assets (css, scripts, images, etc.)
app.use("/public/*", serveStatic({ root: "./" }));

// serve index for root "/"
app.get("/", serveStatic({ path: "./pages/index.html" }));

// post to fetch weather using coordiante
app.post("/api/weathergeo", async (c) => {
  try {
    const { lat, lon } = await c.req.json();

    if (typeof lat !== "number" || typeof lon !== "number") {
      return c.json({
        code: 400,
        message: "Latitude and Longitude are required",
      });
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

// post to find the coordinate
app.post("/api/geolocation", async (c) => {
  try {
    const { city } = await c.req.json();

    if (!city) {
      return c.json({ code: 400, message: "City is required" });
    }

    const countryCodePair = countries as Record<string, string>;
    const country = getCookie(c, "country");

    if (!country || !countryCodePair[country]) {
      return c.json({ error: "Invalid or missing country" }, 400);
    }

    const code = countryCodePair[country];

    const geoRes = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city},${code}&appid=${API_KEY}`
    );

    const coorData = await geoRes.json();

    if (!coorData?.length) {
      return c.json({ code: 400, message: `No ${city} in ${country}` });
    }

    return c.json(coorData);
  } catch (err) {
    console.error("Geo Location failed:", err);
    return c.json({ code: 500, message: "Internal server error" });
  }
});

// post that goes to the weather app
app.post("/weather", async (c) => {
  const body = await c.req.parseBody();
  const country = typeof body.country === "string" ? body.country : "";

  setCookie(c, "country", country, {
    httpOnly: true,
    maxAge: 3600, // valid for 1 hour
    path: "/", // available to all routes
  });

  const html = await Bun.file("./pages/weather.html").text();
  return c.html(html);
});

Bun.serve({
  port: Bun.env.PORT, // Specify your desired port
  fetch: app.fetch,
  error(error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  },
});
