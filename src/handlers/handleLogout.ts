import type { IncomingMessage, ServerResponse } from "http";
import { json } from "../utils/response.js";

export const handleLogout = (req: IncomingMessage, res: ServerResponse) => {
  res.setHeader("Set-Cookie", [
    "auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure",
  ]);

  json(res, 200, { message: "Logged out" });
};
