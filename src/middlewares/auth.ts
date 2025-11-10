import jwt from "jsonwebtoken";
import { json } from "../utils/response.js";
import type { IncomingMessage, ServerResponse } from "http";

interface DecodedToken {
  id: string;
  email: string;
}

export const authMiddleware = (
  req: IncomingMessage & { user?: DecodedToken },
  res: ServerResponse,
  next: () => void
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return json(res, 401, { error: "Нет токена, доступ запрещён" });
  }

  const token = authHeader.replace("Bearer ", "");
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("❌ JWT_SECRET не найден в .env");
    return json(res, 500, { error: "Ошибка конфигурации сервера" });
  }

  try {
    const decoded = jwt.verify(token, secret) as DecodedToken;
    req.user = decoded; // ✅ TS теперь не ругается
    next();
  } catch (err) {
    return json(res, 401, { error: "Недействительный токен" });
  }
};
