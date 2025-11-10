// import { IncomingMessage, ServerResponse } from "http";
// import jwt from "jsonwebtoken";
// import { json } from "../utils/response.js";
// import type { JwtPayload } from "jsonwebtoken"; // импорт только типа

// type Handler = (
//   req: IncomingMessage & { user?: JwtPayload },
//   res: ServerResponse
// ) => Promise<void> | void;

// export const authMiddleware = (handler: Handler) => {
//   return async (
//     req: IncomingMessage & { user?: JwtPayload },
//     res: ServerResponse
//   ) => {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return json(res, 401, { error: "Нет токена" });
//     }

//     const token = authHeader.split(" ")[1];

//     if (!token) {
//       return json(res, 401, { error: "Нет токена" });
//     }

//     try {
//       const decoded = jwt.verify(
//         token,
//         process.env.JWT_SECRET as string
//       ) as JwtPayload;
//       req.user = decoded;
//       return handler(req, res);
//     } catch (err) {
//       return json(res, 401, { error: "Неверный или просроченный токен" });
//     }
//   };
// };
