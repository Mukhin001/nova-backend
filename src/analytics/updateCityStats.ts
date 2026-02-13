import { Db } from "mongodb";

type Subscription = {
  city: string;
  category: string;
};

type Params = {
  db: Db;
  added: Subscription[];
};

type CityStatsDoc = {
  _id: string;
  total: number;
  categories: Record<string, number>;
};

export const updateCityStats = async ({ db, added }: Params) => {
  const collection = db.collection<CityStatsDoc>("city_stats");

  const ops = added.map((sub) =>
    collection.updateOne(
      { _id: sub.city }, // ищем по названию города
      {
        $inc: {
          total: 1,
          [`categories.${sub.category}`]: 1,
        },
        $setOnInsert: {
          categories: { [sub.category]: 1 }, // создаём categories если нет
        },
      },
      { upsert: true },
    ),
  );

  await Promise.all(ops);
};
