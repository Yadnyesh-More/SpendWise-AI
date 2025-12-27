import redis from 'redis';

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
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
