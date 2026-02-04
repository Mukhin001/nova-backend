import jwt from "jsonwebtoken";
import { json } from "../utils/response.js";
export const authMiddleware = (req, res, next) => {
    // получаем токен с фронта
    const cookie = req.headers.cookie;
    if (!cookie) {
        return json(res, 401, { error: "Нет токена, доступ запрещён" });
    }
    const token = cookie
        .split(", ")
        .find((c) => c.startsWith("token="))
        ?.split("=")[1];
    if (!token)
        return json(res, 401, { error: "Нет токена" });
    // получаем ключ токена из файла .env что сравнить ключ и токен создан ли на моем сервере
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        console.error("❌ JWT_SECRET не найден в .env");
        return json(res, 500, { error: "Ошибка конфигурации сервера" });
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded; // ✅ TS теперь не ругается
        next();
    }
    catch (err) {
        return json(res, 401, { error: "Неверный токен" });
    }
};
//# sourceMappingURL=auth.js.map