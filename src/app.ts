import "dotenv/config"; // автоматически загружает глобально .env
import http, { IncomingMessage, ServerResponse } from "http";
import { handleGreet } from "./handlers/greet.js";
import { handleLogin } from "./handlers/handleLogin.js";
import { handleRegister } from "./handlers/handleRegister.js";
import { handleUpdateProfile } from "./handlers/handleUpdateProfile.js";
import { authMiddleware } from "./middlewares/auth.js";

const PORT = Number(process.env.PORT) || 3500;

const setCors = (res: ServerResponse) => {
  // ✅ Разрешаем запросы с других источников (например, фронтенда на 3000)
  // потом это все нужно будет поменять код ниже так как это не безопасно для продакшина
  // Для разработки — localhost. В продакшне заменим на конкретный домен.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    // ✅ Обрабатываем предварительный OPTIONS-запрос
    setCors(res);
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
    if (req.url === "/update-profile" && req.method === "PUT") {
      return authMiddleware(req, res, () => handleUpdateProfile(req, res));
    }
  }
);

server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен в файле app на http://localhost:${PORT}`);
});
