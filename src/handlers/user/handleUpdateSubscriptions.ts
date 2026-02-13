import { dbConnect } from "../../db/mongDbClient.js";
import type { DecodedToken } from "../../middlewares/auth.js";
import { json } from "../../utils/response.js";
import type { IncomingMessage, ServerResponse } from "http";
import { ObjectId } from "mongodb";
import { updateCityStats } from "../../analytics/updateCityStats.js";

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
  const authUser = req.user;
  if (!authUser) {
    return json(res, 401, { error: "Нет токена" });
  }

  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      const parsed: UpdateSubscriptionsBody = JSON.parse(body);

      if (!parsed.subscriptions) {
        return json(res, 400, { error: "Нет массива выбранных городов" });
      }

      if (parsed.subscriptions?.length === 0) {
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
      const userId = authUser.id;
      // Обновляем подписки и получаем результат
      const result = await users.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        {
          $set: {
            subscriptions: parsed.subscriptions,
          },
        },
        { returnDocument: "before" }, // вернёт старый документ
      );

      // ✅ Проверка на null, чтобы TS был доволенif (!result.value)
      if (!result || result === null) {
        return json(res, 404, { error: "Пользователь не найден" });
      }

      const oldSubs = result.subscriptions || [];
      const newSubs = parsed.subscriptions || [];

      // Отфильтровываем реально новые подписки
      const added = newSubs.filter(
        (n) =>
          !oldSubs.some(
            (o: Subscription) => o.city === n.city && o.category === n.category,
          ),
      );

      await updateCityStats({ db, added });
      // Отправляем обновлённые подписки
      return json(res, 200, {
        message: "Подписки обновлены ✅",
        subscriptions: newSubs,
      });
    } catch (err) {
      console.error("❌ Ошибка обработки запроса:", err);
      return json(res, 500, { error: "Ошибка сервера" });
    }
  });
};
