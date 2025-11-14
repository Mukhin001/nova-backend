import { ServerResponse } from "http";

export const json = (
  res: ServerResponse,
  statusCode: number,
  payload: unknown
) => {
  try {
    const body = JSON.stringify(payload);

    if (!res.headersSent) {
      res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body).toString(),
      });

      res.end(body);
    }
  } catch (err) {
    // Если сломался JSON.stringify()
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
    }
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
};

// Удаление ресурса (DELETE)
export const noContent = (res: ServerResponse) => {
  if (!res.headersSent) {
    res.writeHead(204);
  }

  res.end();
};
