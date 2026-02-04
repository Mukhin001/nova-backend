import { IncomingMessage, ServerResponse } from "http";
import { dbConnect } from "../db/mongDbClient.js";
import { json } from "../utils/response.js";
import bcrypt from "bcrypt"; // для хэширования пароля
import jwt from "jsonwebtoken";
export const handleLogin = (req, res) => {
    let body = "";
    // 1. Читаем тело запроса
    req.on("data", (chunk) => {
        body += chunk;
    });
    req.on("end", async () => {
        try {
            // 2. Парсим JSON из тела запроса
            const { email, password } = JSON.parse(body);
            console.log("📥 Получены данные с фронта:");
            if (!email || !password) {
                return json(res, 400, { error: "Все поля обязательны" });
            }
            // 3. Получаем доступ к базе
            let db;
            try {
                db = await dbConnect();
            }
            catch (err) {
                console.error("❌ Ошибка подключения к MongoDB:", err);
                return json(res, 500, { error: "Сервер MongoDB временно недоступен" });
            }
            //const db = await dbConnect();
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
            // ✅ Генерируем токен
            const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
                expiresIn: "1h",
            });
            res.setHeader("Set-Cookie", [
                `auth_token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=None; Secure`,
            ]);
            // 6. Если всё верно
            json(res, 200, {
                message: "Успешный вход ✅",
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                },
            });
        }
        catch (error) {
            console.error("❌ Ошибка логина:", error);
            json(res, 400, { error: "Некорректные данные" });
        }
    });
};
// Читаем тело запроса.
// Парсим JSON.
// Проверяем, что email и password заполнены.
// Ищем пользователя по email в MongoDB.
// Сравниваем переданный пароль с хэшем через bcrypt.compare.
// Если всё верно — возвращаем 200 OK с именем пользователя.
// Если email не найден или пароль не совпадает — возвращаем 401 Unauthorized.
//# sourceMappingURL=handleLogin.js.map