import { IncomingMessage, ServerResponse } from "http";
import { dbConnect } from "../db/mongDbClient.js";
import { json } from "../utils/response.js";
import bcrypt from "bcrypt"; // для хэширования пароля
import jwt from "jsonwebtoken";

export const handleRegister = (req: IncomingMessage, res: ServerResponse) => {
  let body = "";

  // 1. Читаем тело запроса
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      // 2. Парсим JSON из тела запроса
      const { name, email, password } = JSON.parse(body);
      console.log("📥 Получены данные с фронта:", { name, email, password });

      // 3. Проверяем обязательные поля
      if (!name || !email || !password) {
        return json(res, 400, { error: "Все поля обязательны" });
      }

      // 4. Получаем доступ к базе
      const db = await dbConnect();
      const users = db.collection("users");

      // 5. Проверяем, есть ли пользователь с таким email
      const existingUser = await users.findOne({ email });
      if (existingUser) {
        return json(res, 409, { error: "Email уже используется" });
      }

      // 6. Хэшируем пароль
      const passwordHash = await bcrypt.hash(password, 10);

      // 7. Создаем нового пользователя
      const newUser = {
        name,
        email,
        passwordHash,
        createdAt: new Date(),
      };

      const result = await users.insertOne(newUser);

      // ✅ получаем id из результата вставки
      const userId = result.insertedId.toString();

      // ✅ генерируем токен
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });

      res.setHeader("Set-Cookie", [
        `auth_token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=None; Secure`,
      ]);

      // 8. Отправляем успешный ответ
      json(res, 201, {
        message: "Пользователь создан ✅",
        user: {
          id: userId,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
        },
      });
    } catch (error) {
      console.error("❌ Ошибка регистрации:", error);
      json(res, 400, { error: "Неверный формат JSON" });
    }
  });
};

// Читаем тело запроса (stream req.on("data")).
// Парсим JSON из тела.
// Проверяем, что все поля обязательны (name, email, password).
// Подключаемся к MongoDB через dbConnect().
// Проверяем, существует ли уже пользователь с таким email.
// Хэшируем пароль с помощью bcrypt.
// Вставляем нового пользователя в коллекцию users.
// Отправляем клиенту JSON с подтверждением.
