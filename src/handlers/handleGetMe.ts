// import { IncomingMessage, ServerResponse } from "http";
// import { json } from "../utils/response.js";
// import { dbConnect } from "../db/mongDbClient.js";
// import { ObjectId } from "mongodb";
// import type { JwtPayload } from "jsonwebtoken";

// /**
//  * Типизированный запрос — добавляем поле user
//  */
// type AuthReq = IncomingMessage & { user?: JwtPayload | { id?: string } };

// export const handleGetMe = async (req: AuthReq, res: ServerResponse) => {
//   try {
//     if (!req.user || typeof req.user !== "object" || !("id" in req.user)) {
//       return json(res, 401, { error: "Нет токена, доступ запрещён" });
//     }

//     const userId = String((req.user as any).id); // явно приводим к строке

//     // 0) ВАЛИДАЦИЯ: обязательно проверяем, что userId соответствует ObjectId
//     if (!ObjectId.isValid(userId)) {
//       return json(res, 400, { error: "Неверный идентификатор пользователя" });
//     }

//     const db = await dbConnect();
//     const usersCollection = db.collection("users");

//     // 1) Поиск по _id (new ObjectId(userId) безопасен после isValid)
//     const user = await usersCollection.findOne(
//       { _id: new ObjectId(userId) },
//       { projection: { passwordHash: 0 } } // исключаем пароль
//     );

//     if (!user) {
//       return json(res, 404, { error: "Пользователь не найден" });
//     }

//     return json(res, 200, user);
//   } catch (err) {
//     console.error("handleGetMe error:", err);
//     return json(res, 500, { error: "Ошибка сервера" });
//   }
// };
