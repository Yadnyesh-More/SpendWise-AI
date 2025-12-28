import redis from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const client = redis.createClient({
  url: redisUrl,
});

client.on('error', (err) => {
  console.warn('⚠️ Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('✅ Redis Connected');
});

// Connect to Redis
client.connect().catch(err => {
  console.warn('⚠️ Redis Connection Warning:', err.message);
});

export default client;
