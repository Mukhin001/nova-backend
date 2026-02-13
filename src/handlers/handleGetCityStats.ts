import { IncomingMessage, ServerResponse } from "http";
import { json } from "../utils/response.js";
import { dbConnect } from "../db/mongDbClient.js";

export const handleGetCityStats = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  try {
    let db = await dbConnect();
    const collection = db.collection("city_stats");

    if (!collection || collection === null) {
      return json(res, 404, { error: "Коллекция пуста" });
    }

    const stats = await collection.find({}).sort({ total: -1 }).toArray();

    return json(res, 200, { cities: stats });
  } catch (err) {
    console.error("❌ Ошибка подключения к MongoDB:", err);
    return json(res, 500, { error: "Сервер MongoDB временно недоступен" });
  }
};
