import type { IncomingMessage, ServerResponse } from "http";
import { json } from "../utils/response.js";

const getHeader = (value: string | string[] | undefined): string | null => {
  if (value === undefined) return null;

  if (Array.isArray(value)) {
    const first = value[0];
    return first !== undefined ? first : null;
  }

  return value;
};

export const handleDevice = (req: IncomingMessage, res: ServerResponse) => {
  try {
    const chMobile = getHeader(req.headers["sec-ch-ua-mobile"]);
    const chPlatformRaw = getHeader(req.headers["sec-ch-ua-platform"]);

    const platform =
      chPlatformRaw !== null ? chPlatformRaw.replace(/"/g, "") : null;

    let deviceType: "mobile" | "desktop" = "mobile";
    let source: "client-hints" | "user-agent" | "default" = "default";

    if (chMobile === "?1") {
      deviceType = "mobile";
      source = "client-hints";
    } else if (chMobile === "?0") {
      deviceType = "desktop";
      source = "client-hints";
    }

    const ua = req.headers["user-agent"]?.toLowerCase() || "";

    if (source !== "client-hints") {
      deviceType = /iphone|android|ipad|mobile/i.test(ua)
        ? "mobile"
        : "desktop";
      source = "user-agent";
    }

    let browser = "Unknown";
    if (ua.includes("edg")) browser = "Edge";
    else if (ua.includes("chrome")) browser = "Chrome";
    else if (ua.includes("firefox")) browser = "Firefox";
    else if (ua.includes("safari")) browser = "Safari";

    let os = "Unknown";
    if (ua.includes("windows")) os = "Windows";
    else if (ua.includes("mac os")) os = "macOS";
    else if (ua.includes("android")) os = "Android";
    else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";
    else if (ua.includes("linux")) os = "Linux";

    const isTouch = chMobile === "?1" || /iphone|android|ipad/i.test(ua);

    return json(res, 200, {
      device: {
        type: deviceType,
        isTouch,
      },
      client: {
        browser,
        os,
        platform,
      },
      source,
    });
  } catch (error) {
    console.error("handleDevice error:", error);

    return json(res, 200, {
      device: {
        type: "mobile",
        isTouch: true,
      },
      client: {
        browser: "Unknown",
        os: "Unknown",
        platform: null,
      },
      source: "default",
    });
  }
};
