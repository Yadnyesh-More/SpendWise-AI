// 🚫 REDIS DISABLED - Production Ready (Render)
const redis = {
  del: async (key) => {
    console.log(`🚫 Redis SKIP: del(${key})`);
    return true;
  },
  get: async (key) => {
    console.log(`🚫 Redis SKIP: get(${key})`);
    return null;
  },
  setEx: async (key, ttl, value) => {
    console.log(`🚫 Redis SKIP: setEx(${key}, ${ttl})`);
    return true;
  },
  connect: async () => {
    console.log('🚫 Redis: Disabled on Render');
  }
};

export default redis;
