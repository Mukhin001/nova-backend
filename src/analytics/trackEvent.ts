import type { IncomingMessage } from "http";
import type { Db } from "mongodb";

interface TrackEventParams {
  db: Db;
  req: IncomingMessage;
  event: string;
  userId?: string | null;
  data?: Record<string, any>;
}

export const trackEvent = async ({
  db,
  req,
  event,
  userId,
  data,
}: TrackEventParams) => {
  try {
    await db.collection("analytics_events").insertOne({
      event,
      userId,
      data,
      ip: req.socket.remoteAddress || null,
      ua: req.headers["user-agent"] || null,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("Analytics error:", err);
  }
};
