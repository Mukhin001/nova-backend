import type { IncomingMessage } from "http";

export const getLocationByIp = async (req: IncomingMessage) => {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress;

  if (!ip || ip === "::1") {
    return null;
  }

  const response = await fetch(`http://ip-api.com/json/${ip}`);
  if (!response.ok) return null;

  const data = await response.json();

  return {
    country: data.countryCode,
    city: data.city,
    lat: data.lat,
    lon: data.lon,
  };
};
