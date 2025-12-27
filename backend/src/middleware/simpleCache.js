// backend/middleware/simpleCache.js
import redis from "redis";

const client = redis.createClient();

client.on("error", (err) => console.error("Redis Error:", err));

await client.connect();

const simpleCache = async (req, res, next) => {
  const key = req.originalUrl;

  try {
    const cachedData = await client.get(key);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const originalJson = res.json.bind(res);

    res.json = (data) => {
      client.setEx(key, 5, JSON.stringify(data)); // cache for 60 sec
      originalJson(data);
    };

    next();
  } catch (err) {
    console.error("Cache error:", err);
    next();
  }
};

export default simpleCache;

