import { dbConnect } from "../db/mongDbClient.js";
import type { IncomingMessage, ServerResponse } from "http";
import { json } from "../utils/response.js";

export const handleAnalytics = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  try {
    const db = await dbConnect();
    const analytics = db.collection("analytics_events");

    const events = await analytics
      .find({})
      .sort({ createdAt: -1 }) // самые новые сверху
      .toArray();

    return json(res, 200, { events });
  } catch (err) {
    console.error("❌ Ошибка получения аналитики:", err);
    return json(res, 500, { error: "❌ Ошибка получения аналитики" });
  }
};
