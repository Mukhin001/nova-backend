import { IncomingMessage, ServerResponse } from "http";
import { json } from "../utils/response.js";

/**
 * Обработчик возвращает простое приветствие.
 * Можно принимать req, если захочется смотреть метод/заголовки.
 */
export const handleGreet = (req: IncomingMessage, res: ServerResponse) => {
  // Если нужно — можно различать GET/POST и т.д.
  json(res, 200, { message: "Greetings from the server, Nova App!" });
};
