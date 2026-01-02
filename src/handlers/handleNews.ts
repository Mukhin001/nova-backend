import type { IncomingMessage, ServerResponse } from "http";
import { json } from "../utils/response.js";

export const handleNews = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const url = new URL(req.url ?? "", `http://${req.headers.host}`);

    const category = url.searchParams.get("category");
    const apiUrl = new URL("https://newsdata.io/api/1/latest");
    apiUrl.searchParams.set("apikey", process.env.NEWS_API_KEY!);

    if (category) {
      apiUrl.searchParams.set("category", category);
    }

    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      return json(res, response.status, { message: "News API error" });
    }

    const data = await response.json();

    // ⬇️ ВАЖНО: отдаём ТОЛЬКО массив новостей
    return json(res, 200, data.results ?? []);
  } catch (error) {
    return json(res, 500, { message: "Internal server error" });
  }
};
