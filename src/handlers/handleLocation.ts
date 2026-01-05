import type { IncomingMessage, ServerResponse } from "http";
import { getLocationByIp } from "../utils/getLocationByIp.js";
import { json } from "../utils/response.js";

export const handleLocation = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  try {
    const location = await getLocationByIp(req);

    if (!location) {
      return json(res, 200, {
        country: "ru",
        city: "Moscow",
      });
    }

    return json(res, 200, location);
  } catch (error) {
    return json(res, 500, { message: "Failed to detect location" });
  }
};
