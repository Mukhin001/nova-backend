import { IncomingMessage, ServerResponse } from "http";
import { json } from "../utils/response";

/**
 * Обработчик возвращает простое приветствие.
 * Можно принимать req, если захочется смотреть метод/заголовки.
 */
export const handleGreet = (
  req: IncomingMessage,
  res: ServerResponse
): void => {
  // Если нужно — можно различать GET/POST и т.д.
  json(res, 200, { message: "Hello, Nova App!" });
};
