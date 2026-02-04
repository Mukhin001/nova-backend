import { json } from "../utils/response.js";
import { dbConnect } from "../db/mongDbClient.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
export const handleUpdateProfile = (req, res) => {
    try {
        if (!req.user) {
            console.log(req.user);
            return json(res, 401, { error: "Нет токена" });
        }
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
            const { name, email, password, password_new } = JSON.parse(body);
            if (!name || !email || !password || !password_new) {
                return json(res, 400, { error: "Все поля обязательны" });
            }
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
            if (!req.user) {
                console.log(req.user);
                return json(res, 401, { error: "Нет токена" });
            }
            const userId = req.user.id;
            const user = await users.findOne({ _id: new ObjectId(userId) });
            if (!user) {
                return json(res, 404, { error: "Пользователь не найден" });
            }
            const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordCorrect) {
                return json(res, 401, { error: "Неверный текущий пароль" });
            }
            const updatedFields = { name, email };
            if (password_new && password_new.length >= 6) {
                updatedFields.passwordHash = await bcrypt.hash(password_new, 10);
            }
            await users.updateOne({ _id: user._id }, { $set: updatedFields });
            console.log("Данные обновлены ✅", name, email);
            json(res, 200, {
                message: "Данные обновлены ✅",
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                },
            });
        });
    }
    catch (error) {
        return json(res, 500, { error: "Ошибка сервера" });
    }
};
//# sourceMappingURL=handleUpdateProfile.js.map