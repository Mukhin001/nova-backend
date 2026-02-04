import type { IncomingMessage, ServerResponse } from "http";
import { json } from "@/utils/response.js";
import { dbConnect } from "@/db/mongDbClient.js";
import { ObjectId } from "mongodb";
import type { DecodedToken } from "@/middlewares/auth.js";

export const handleMe = async (
  req: IncomingMessage & { user?: DecodedToken },
  res: ServerResponse,
) => {
  try {
    if (!req.user) return json(res, 401, { error: "Нет токена" });

    const db = await dbConnect();
    const users = db.collection("users");
    const user = await users.findOne({
      _id: new ObjectId(req.user.id),
    });

    if (!user) return json(res, 401, { error: "Пользователь не найден" });

    json(res, 200, {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        subscriptions: user.subscriptions, // если нужно отдавать подписки
        settings: user.settings, // если нужно отдавать настройки
      },
    });
  } catch (err) {
    console.error("❌ Ошибка подключения к MongoDB:", err);
    return json(res, 500, { error: "Сервер MongoDB временно недоступен" });
  }
};
