import { IncomingMessage, ServerResponse } from "http";
import { dbConnect } from "../db/mongDbClient.js";
import { json } from "../utils/response.js";
import bcrypt from "bcrypt"; // для хэширования пароля
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import { LIMITS } from "../constants/validation.js";
import { validateEmail } from "../utils/validateEmail.js";

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
      //console.log("📥 Получены данные с фронта:");

      if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        return json(res, 400, { error: "Некорректные данные" });
      }

      // 3. Проверяем обязательные поля
      if (!name.trim() || !email.trim() || !password) {
        return json(res, 400, { error: "Все поля обязательны" });
      }

      if (name.length > LIMITS.NAME_MAX) {
        return json(res, 400, { error: "Имя не должно превышать 50 символов" });
      }

      if (email.length > LIMITS.EMAIL_MAX) {
        return json(res, 400, {
          error: "Email не должен превышать 255 символов",
        });
      }

      if (password.length > LIMITS.PASSWORD_MAX) {
        return json(res, 400, {
          error: "Пароль не должен превышать 128 символов",
        });
      }

      if (!validateEmail(email)) {
        return json(res, 400, { error: "Некорректный email" });
      }

      // 3.1 проверка пароля
      if (password.length < LIMITS.PASSWORD_MIN) {
        return json(res, 400, {
          error: "Пароль должен быть минимум 8 символов!",
        });
      }

      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/;
      if (!passRegex.test(password)) {
        return json(res, 400, {
          error:
            "Пароль должен содержать одну заглавную букву, одну строчную, одну цифру и один спецсимвол.",
        });
      }

      // 4. Получаем доступ к базе
      let db;
      try {
        db = await dbConnect();
      } catch (err) {
        console.error("❌ Ошибка подключения к MongoDB:", err);
        return json(res, 500, { error: "Сервер MongoDB временно недоступен" });
      }
      //const db = await dbConnect();
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

      // ⬇️⬇️⬇️ Отправляем письмо
      sendEmail(
        email,
        "Регистрация в Nova App!",
        `Здравствуйте, ${name}!
        Вы успешно зарегистрировались в сервисе Nova App.
        Теперь вам доступны все функции приложения:
        • управление профилем  
        • персональные настройки  
        • быстрый вход  
        Если вы не регистрировались — просто игнорируйте это письмо.
        С уважением,  
        Команда Nova App.`
      ).catch(console.error); // не ломаем регистрацию, если письмо не ушло

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
