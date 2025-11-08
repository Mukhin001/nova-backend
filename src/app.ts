import "dotenv/config"; // автоматически загружает .env
import http, { IncomingMessage, ServerResponse } from "http";
import { handleGreet } from "./handlers/greet.js";
import { handleLogin } from "./handlers/handleLogin.js";
import { handleRegister } from "./handlers/handleRegister.js";

const PORT: number = 3500;

const setCors = (res: ServerResponse) => {
  // ✅ Разрешаем запросы с других источников (например, фронтенда на 3000)
  // потом это все нужно будет поменять код ниже так как это не безопасно для продакшина
  // Для разработки — localhost. В продакшне заменим на конкретный домен.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    setCors(res);

    // ✅ Обрабатываем предварительный OPTIONS-запрос
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === "/" && req.method === "GET") {
      handleGreet(req, res);
      return;
    }

    // ✅ Маршрут регистрации
    if (req.url === "/register" && req.method === "POST") {
      return handleRegister(req, res);
    }
    if (req.url === "/login" && req.method === "POST") {
      return handleLogin(req, res);
    }
  }
);

server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен в файле app на http://localhost:${PORT}`);
});
