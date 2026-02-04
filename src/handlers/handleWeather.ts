import type { IncomingMessage, ServerResponse } from "http";
import { json } from "../utils/response.js";

export const handleWeather = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  try {
    // 1️⃣ Парсим URL
    const url = new URL(req.url ?? "", `http://${req.headers.host}`);
    // 2️⃣ Достаём city из url
    const city = url.searchParams.get("city");

    if (!city) {
      return json(res, 400, { message: "City is required" });
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=ru&appid=${process.env.WEATHER_API_KEY}`
    );

    if (!response.ok) {
      return json(res, response.status, { message: "Weather API error" });
    }

    const data = await response.json();
    return json(res, 200, data);
  } catch (error) {
    return json(res, 500, { message: "Internal server error" });
  }
};
