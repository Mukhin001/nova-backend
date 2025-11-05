import { IncomingMessage, ServerResponse } from "http";
import { json } from "../utils/response";

export const handleRegister = (req: IncomingMessage, res: ServerResponse) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    try {
      const parsedData = JSON.parse(body);
      console.log("📥 Получены данные с фронта:", parsedData);

      json(res, 200, { message: "Данные успешно получены ✅" });
    } catch (error) {
      console.error("❌ Ошибка парсинга:", error);

      json(res, 400, { error: "Неверный формат JSON" });
    }
  });
};
