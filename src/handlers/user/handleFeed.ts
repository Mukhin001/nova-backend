import { error } from "console";
import { dbConnect } from "../../db/mongDbClient.js";
import type { DecodedToken } from "../../middlewares/auth.js";
import { json } from "../../utils/response.js";
import type { IncomingMessage, ServerResponse } from "http";
import { ObjectId } from "mongodb";

type Subscription = {
  city: string;
  category: string;
};

type NewsApiItem = {
  title: string;
  description: string;
  link: string;
  pubDate: string;
};

type NewsApiResponse = {
  results: NewsApiItem[];
};

export const handleFeed = async (
  req: IncomingMessage & { user?: DecodedToken },
  res: ServerResponse,
) => {
  if (!req.user) {
    return json(res, 401, { error: "Нет токена" });
  }

  let db;
  try {
    db = await dbConnect();
  } catch (err) {
    console.error("❌ Ошибка подключения к MongoDB:", err);
    return json(res, 500, { error: "Сервер MongoDB временно недоступен" });
  }

  const users = db.collection("users");
  const userId = req.user?.id;

  const user = await users.findOne({ _id: new ObjectId(userId) });
  const subscriptions = user?.subscriptions;

  if (!user) {
    return json(res, 404, { error: "Пользователь не найден" });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return json(res, 404, { error: "Не выбрали ни одного города" });
  }

  try {
    const feed = await Promise.all(
      subscriptions.map(async (sub: Subscription) => {
        const { city, category } = sub;

        // 1️⃣ погода
        let weather = null;
        try {
          const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=ru&appid=${process.env.WEATHER_API_KEY}`,
          );

          if (!weatherRes.ok) {
            throw new Error("Weather API error");
          }

          const weatherJson = await weatherRes.json();
          weather = {
            temp: weatherJson.main?.temp,
            feelsLike: weatherJson.main?.feels_like,
            humidity: weatherJson.main?.humidity,
            condition: weatherJson.weather?.[0]?.main,
            description: weatherJson.weather?.[0]?.description,
            icon: weatherJson.weather?.[0]?.icon,
          };
        } catch (err) {
          console.error("Weather failed:", city, err);
          weather = null;
        }

        let news = [];
        try {
          const newsRes = await fetch(
            `https://newsdata.io/api/1/latest?apikey=${process.env.NEWS_API_KEY}&category=${category}&q=${city}`,
          );
          console.log("News status:", newsRes.status);
          console.log("News url:", newsRes.url);
          if (!newsRes.ok) {
            throw new Error("News API error");
          }
          const newsJson = await newsRes.json();
          news = newsJson.results ?? [];
        } catch (err) {
          console.error("News failed:", city, err);
          news = [];
        }

        return {
          city,
          category,
          weather,
          news,
        };
      }),
    );

    return json(res, 200, feed);
  } catch (err) {
    console.error("❌ Feed error:", err);
    return json(res, 500, { error: "Ошибка формирования ленты" });
  }
};
