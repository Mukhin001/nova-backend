import http, { IncomingMessage, ServerResponse } from "http";

const PORT: number = 3500;

http
  .createServer((req: IncomingMessage, res: ServerResponse) => {
    // ✅ Разрешаем запросы с других источников (например, фронтенда на 3000)
    // потом это все нужно будет поменять код ниже так как это не безопасно для продакшина
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // ✅ Обрабатываем предварительный OPTIONS-запрос
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Hello, Nova App!" }));
  })
  .listen(PORT);

console.log(`🚀 Сервер запущен в файле app на http://localhost:${PORT}`);

//("mongodb+srv://mukhinigorgen_db_user:23HeHAj9Lc3cM1sz@userdbcluster.nnj8bbk.mongodb.net/?appName=UserDBCluster");
// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://mukhinigorgen_db_user:23HeHAj9Lc3cM1sz@userdbcluster.nnj8bbk.mongodb.net/?appName=UserDBCluster";
// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });
// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);

// заменить код связь сервера с фронтом
// Как сделать безопасно в будущем (для продакшена)

// Когда ты будешь разворачивать сервер (например, на Render, Vercel, Railway и т.д.),
// тогда замени * на конкретный адрес фронтенда:

// res.setHeader("Access-Control-Allow-Origin", "https://nova-app.vercel.app");

// Можно даже динамически проверять:

// const allowedOrigins = ["https://nova-app.vercel.app", "http://localhost:3000"];
// if (req.headers.origin && allowedOrigins.includes(req.headers.origin)) {
//   res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
// }
// конец
