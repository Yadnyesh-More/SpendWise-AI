// import redis from "redis";

// // ✅ DISABLE REDIS ON RENDER (production)
// const USE_REDIS = process.env.USE_REDIS === 'true' || process.env.NODE_ENV !== 'production';

// let client;

// if (USE_REDIS) {
//   client = redis.createClient({
//     url: process.env.REDIS_URL || 'redis://localhost:6379'
//   });
  
//   client.on("error", (err) => console.error("⚠️ Redis Client Error:", err));
  
//   client.connect().catch((err) => {
//     console.error("❌ Redis connection failed:", err);
//   });
// }

// const simpleCache = async (req, res, next) => {
//   // Skip cache if no Redis
//   if (!USE_REDIS || !client) {
//     console.log("📦 Cache disabled - using direct response");
//     return next();
//   }

//   const key = req.originalUrl;

//   try {
//     const cachedData = await client.get(key);

//     if (cachedData) {
//       console.log("✅ Cache HIT:", key);
//       return res.json(JSON.parse(cachedData));
//     }

//     console.log("📦 Cache MISS:", key);
    
//     const originalJson = res.json.bind(res);

//     res.json = (data) => {
//       client.setEx(key, 300, JSON.stringify(data)); // 5 min cache
//       originalJson(data);
//     };

//     next();
//   } catch (err) {
//     console.error("⚠️ Cache error:", err);
//     next(); // Continue without cache
//   }
// };

// export default simpleCache;

// ✅ NO REDIS - Production Ready (Render)
const simpleCache = (req, res, next) => {
  console.log("📦 Cache: SKIPPED (Redis disabled on Render)");
  next(); // Direct response - FASTER!
};

export default simpleCache;

