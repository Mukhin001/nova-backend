import jwt from "jsonwebtoken";
import { json } from "../utils/response.js";
import type { IncomingMessage, ServerResponse } from "http";
import { getAuthToken } from "../utils/getAuthToken.js";

interface DecodedToken {
  id: string;
  email: string;
}

export const authMiddleware = (
  req: IncomingMessage & { user?: DecodedToken },
  res: ServerResponse,
  next: () => void,
) => {
  const token = getAuthToken(req);

  if (!token) return json(res, 401, { error: "Нет токена" });
  // получаем ключ токена из файла .env что сравнить ключ и токен создан ли на моем сервере
  const secretKey = process.env.JWT_SECRET;

  if (!secretKey) {
    console.error("❌ JWT_SECRET не найден в .env");
    return json(res, 500, { error: "Ошибка конфигурации сервера" });
  }

  try {
    const decoded = jwt.verify(token, secretKey) as DecodedToken;
    req.user = decoded; // ✅ TS теперь не ругается
    next();
  } catch (err) {
    return json(res, 401, { error: "Неверный токен" });
  }
};
