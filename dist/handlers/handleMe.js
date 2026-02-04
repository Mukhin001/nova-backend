import { json } from "../utils/response.js";
import jwt from "jsonwebtoken";
import { dbConnect } from "../db/mongDbClient.js";
import { ObjectId } from "mongodb";
export const handleMe = async (req, res) => {
    try {
        const cookieHeader = req.headers.cookie || "";
        const token = cookieHeader
            .split("; ")
            .find((row) => row.startsWith("auth_token="))
            ?.split("=")[1];
        if (!token) {
            return json(res, 401, { error: "Нет токена" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let db;
        try {
            db = await dbConnect();
        }
        catch (err) {
            console.error("❌ Ошибка подключения к MongoDB:", err);
            return json(res, 500, { error: "Сервер MongoDB временно недоступен" });
        }
        //const db = await dbConnect();
        const users = db.collection("users");
        if (!decoded ||
            typeof decoded === "string" ||
            typeof decoded.id !== "string") {
            return json(res, 401, { error: "Неверный токен" });
        }
        const user = await users.findOne({
            _id: new ObjectId(decoded.id),
        });
        if (!user) {
            return json(res, 401, { error: "Пользователь не найден" });
        }
        console.log(cookieHeader);
        json(res, 200, {
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    }
    catch (err) {
        json(res, 401, { error: "Ошибка токена" });
    }
};
//# sourceMappingURL=handleMe.js.map