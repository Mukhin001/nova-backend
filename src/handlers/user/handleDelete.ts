import type { IncomingMessage, ServerResponse } from "http";
import { json } from "../../utils/response.js";
import { dbConnect } from "../../db/mongDbClient.js";
import bcrypt from "bcrypt"; // для хэширования пароля
import { sendEmail } from "../../utils/sendEmail.js";

export const handleDelete = (req: IncomingMessage, res: ServerResponse) => {
  let body = "";

  // 1. Читаем тело запроса
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      const { email, password } = JSON.parse(body);
      console.log("📥 Получены данные с фронта:", email);

      if (!email || !password) {
        return json(res, 400, { error: "Все поля обязательны" });
      }

      //const db = await dbConnect();
      let db;
      try {
        db = await dbConnect();
      } catch (err) {
        console.error("❌ Ошибка подключения к MongoDB:", err);
        return json(res, 500, { error: "Сервер MongoDB временно недоступен" });
      }
      const users = db.collection("users");
      // 4. Ищем пользователя по email
      const user = await users.findOne({ email });

      if (!user) {
        return json(res, 404, {
          error: "Пользователь с таким email не найден",
        });
      }

      // 5. Проверяем пароль
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return json(res, 401, { error: "Неверный пароль" });
      }

      // 3. УДАЛЯЕМ ПОЛЬЗОВАТЕЛЯ ❗❗❗
      await users.deleteOne({ email });
      // ⬇️⬇️⬇️ Отправляем письмо
      try {
        await sendEmail(
          email,
          "Ваш аккаунт был удалён — Nova App",
          `Здравствуйте!

        Ваш аккаунт в Nova App был успешно удалён.
        Все личные данные, профиль и настройки были стерты из базы.

        Если вы не запрашивали удаление — незамедлительно свяжитесь с поддержкой.

        С уважением,
        Команда Nova App`,
        );
        console.log("📧 Письмо отправлено");
      } catch (e) {
        console.error("❌ Ошибка отправки письма:", e);
      } // не ломаем регистрацию, если письмо не ушло

      // 6. ответ
      json(res, 200, { message: "Аккаунт удалён полностью ✅" });
    } catch (error) {
      console.error("❌  Ошибка удаления пользователя:", error);

      json(res, 500, { error: "Ошибка сервера" });
    }
  });
};
