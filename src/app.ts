import "dotenv/config"; // автоматически загружает глобально .env
import http, { IncomingMessage, ServerResponse } from "http";
import { handleGreet } from "./handlers/greet.js";
import { handleLogin } from "./handlers/user/handleLogin.js";
import { handleRegister } from "./handlers/user/handleRegister.js";
import { handleUpdateProfile } from "./handlers/user/handleUpdateProfile.js";
import { authMiddleware } from "./middlewares/auth.js";
import { handleMe } from "./handlers/user/handleMe.js";
import { handleLogout } from "./handlers/user/handleLogout.js";
import { handleDelete } from "./handlers/user/handleDelete.js";
import { handleWeather } from "./handlers/handleWeather.js";
import { handleNews } from "./handlers/handleNews.js";
import { handleLocation } from "./handlers/handleLocation.js";
import { handleDevice } from "./handlers/handleDevice.js";
import { handleUpdateSubscriptions } from "./handlers/user/handleUpdateSubscriptions.js";
import { handleFeed } from "./handlers/user/handleFeed.js";
// FRONTEND_URL = https://your-project.vercel.app
const FRONTEND_URL = (
  process.env.FRONTEND_URL || "http://localhost:3000"
).replace(/\/$/, "");

const PORT = Number(process.env.PORT) || 3000;

const setCors = (res: ServerResponse) => {
  // ✅ Разрешаем запросы с других источников (например, фронтенда на 3000)
  // потом это все нужно будет поменять код ниже так как это не безопасно для продакшина
  // Для разработки — localhost. В продакшне заменим на конкретный домен.
  res.setHeader("Access-Control-Allow-Origin", FRONTEND_URL);
  res.setHeader("Access-Control-Allow-Credentials", "true");
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
    if (req.url === "/device" && req.method === "GET") {
      return handleDevice(req, res);
    }
    if (req.url === "/location" && req.method === "GET") {
      return handleLocation(req, res);
    }
    if (req.url === "/user/me" && req.method === "GET") {
      return authMiddleware(req, res, () => handleMe(req, res));
    }
    if (req.url?.startsWith("/weather") && req.method === "GET") {
      return handleWeather(req, res);
    }
    if (req.url?.startsWith("/news") && req.method === "GET") {
      return handleNews(req, res);
    }
    if (req.url === "/user/register" && req.method === "POST") {
      return handleRegister(req, res);
    }
    if (req.url === "/user/login" && req.method === "POST") {
      return handleLogin(req, res);
    }
    if (req.url === "/user/update-profile" && req.method === "PUT") {
      return authMiddleware(req, res, () => handleUpdateProfile(req, res));
    }
    if (req.url === "/user/logout" && req.method === "POST") {
      return handleLogout(req, res);
    }
    if (req.url === "/user/delete-user" && req.method === "POST") {
      return handleDelete(req, res);
    }
    if (req.url === "/user/subscription-settings" && req.method === "PUT") {
      return authMiddleware(req, res, () =>
        handleUpdateSubscriptions(req, res),
      );
    }
    if (req.url === "/user/feed" && req.method === "GET") {
      return authMiddleware(req, res, () => handleFeed(req, res));
    }
  },
);

// --- ОБРАБОТКА ЗАКРЫТИЯ СЕРВЕРА ---
function shutdown() {
  console.log("🛑 Закрываем сервер...");
  server.close(() => {
    console.log("✅ Сервер остановлен");
    process.exit(0); // код выхода 0 = успешное завершение
  });
}

// Отслеживаем сигналы завершения процесса
process.on("SIGINT", shutdown); // Ctrl+C
process.on("SIGTERM", shutdown); // системное завершение

server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен в файле app на port ${PORT}`);
});
