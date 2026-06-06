import { createClient } from "redis";

interface RateLimitClient {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number | boolean>;
}

let _client: RateLimitClient | null = null;

async function getClient(): Promise<RateLimitClient | null> {
  if (!process.env.REDIS_URL) return null;
  if (_client) return _client;

  try {
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (err: Error) => console.error("Redis error", err));
    await client.connect();
    _client = client;
    return _client;
  } catch {
    return null;
  }
}

export async function checkRateLimit(
  ip: string,
  limit = 100,
  windowSeconds = 60,
): Promise<boolean> {
  const client = await getClient();
  if (!client) return true; // fail open — no Redis configured

  try {
    const key   = `rl:${ip}`;
    const count = await client.incr(key);
    if (count === 1) await client.expire(key, windowSeconds);
    return count <= limit;
  } catch {
    return true; // fail open — Redis down
  }
}
