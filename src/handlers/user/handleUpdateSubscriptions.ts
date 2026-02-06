import { dbConnect } from "../../db/mongDbClient.js";
import type { DecodedToken } from "../../middlewares/auth.js";
import { json } from "../../utils/response.js";
import type { IncomingMessage, ServerResponse } from "http";
import { ObjectId } from "mongodb";

type Subscription = {
  city: string;
  category: string;
};

interface UpdateSubscriptionsBody {
  subscriptions: Subscription[];
}

export const handleUpdateSubscriptions = (
  req: IncomingMessage & { user?: DecodedToken },
  res: ServerResponse,
) => {
  // ✅ Проверка на наличие токена сразу
  if (!req.user) {
    return json(res, 401, { error: "Нет токена" });
  }

  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      const parsed: UpdateSubscriptionsBody = JSON.parse(body);

      if (!parsed.subscriptions || parsed.subscriptions.length === 0) {
        return json(res, 400, { error: "Не выбрали ни одного города" });
      }

      let db;
      try {
        db = await dbConnect();
      } catch (err) {
        console.error("❌ Ошибка подключения к MongoDB:", err);
        return json(res, 500, { error: "Сервер MongoDB временно недоступен" });
      }

      const users = db.collection("users");
      const userId = req.user?.id;

      // Обновляем подписки и получаем результат
      const result = await users.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        {
          $set: {
            subscriptions: parsed.subscriptions,
          },
        },
        { returnDocument: "after" }, // вернёт обновлённый документ
      );

      // ✅ Проверка на null, чтобы TS был доволен
      if (!result) {
        return json(res, 404, { error: "Пользователь не найден" });
      }

      const updatedUser = result.value || result;

      //console.log(updatedUser.subscriptions);
      // Отправляем обновлённые подписки
      return json(res, 200, {
        message: "Подписки обновлены ✅",
        subscriptions: updatedUser.subscriptions,
      });
    } catch (err) {
      console.error("❌ Ошибка обработки запроса:", err);
      return json(res, 500, { error: "Ошибка сервера" });
    }
  });
};
