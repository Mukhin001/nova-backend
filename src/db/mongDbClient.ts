import { MongoClient, Db } from "mongodb";
//import fs from "fs";
// 1 Берём URL из переменных окружения в .env
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) throw new Error("MONGO_URL не задан в .env");

//2 Создаём клиента с безопасными опциями для Atlas
const client = new MongoClient(MONGO_URL, {
  //tls: true, // включаем TLS
  //tlsAllowInvalidCertificates: false, // не игнорируем сертификаты
  serverApi: { version: "1" }, // рекомендуемая версия API для Atlas
});

// 3. Переменная для хранения инстанса базы данных
let dbInstanse: Db | null = null;
/**
 * 4. Функция для подключения к базе данных
 *    - Если dbInstance уже существует, возвращаем его
 *    - Иначе подключаемся к MongoDB Atlas и сохраняем
 */
export const dbConnect = async (): Promise<Db> => {
  if (!dbInstanse) {
    try {
      await client.connect(); // подключаемся к MongoDB
      dbInstanse = client.db("UserDBCluster"); // имя базы данных
      //console.log("✅ MongoDB подключена");
    } catch (err) {
      console.error("❌ Ошибка подключения к MongoDB:", err);
      throw err;
    }
  }
  return dbInstanse;
};

/**
 * 5 Функция для безопасного закрытия подключения (опционально)
 */
// export const dbDisConnect = async () => {
//    if (client.isConnected()) {
//     await client.close();
//     dbInstance = null;
//     console.log("MongoDB отключена");
//   }
// }
// Пояснения шаг за шагом:
// Берем URL из .env.local, чтобы не хранить пароль в коде.
// Создаем один MongoClient, чтобы не подключаться каждый раз заново.
// dbInstance хранит одно соединение с базой.
// dbConnect() всегда возвращает готовую базу, подключение происходит только один раз.
