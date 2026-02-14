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
      { _id: sub.city },
      {
        $inc: {
          total: 1,
          [`categories.${sub.category}`]: 1,
        },
      },
      { upsert: true },
    ),
  );
  console.log("new city ops:", ops);

  await Promise.all(ops);
};
