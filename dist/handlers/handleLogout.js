import { json } from "../utils/response.js";
export const handleLogout = (req, res) => {
    res.setHeader("Set-Cookie", [
        "auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure",
    ]);
    json(res, 200, { message: "Logged out" });
};
//# sourceMappingURL=handleLogout.js.map