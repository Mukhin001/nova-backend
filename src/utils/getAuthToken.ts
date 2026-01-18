import type { IncomingMessage } from "http";

export const getAuthToken = (req: IncomingMessage) => {
  const cookie = req.headers.cookie;

  if (!cookie) return null;

  return (
    cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1] || null
  );
};
