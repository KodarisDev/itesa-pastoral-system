import "server-only";

interface Bucket {
  attempts: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const MAX_BUCKETS = 10_000;

function prune(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  while (buckets.size > MAX_BUCKETS) {
    const firstKey = buckets.keys().next().value;
    if (firstKey === undefined) break;
    buckets.delete(firstKey);
  }
}

export function checkLoginRateLimit(ip: string, username: string): boolean {
  const now = Date.now();
  prune(now);
  return [ip, username].every((key) => {
    const bucket = buckets.get(`login:${key}`);
    return !bucket || bucket.attempts < MAX_ATTEMPTS || bucket.resetAt <= now;
  });
}

export function consumeRateLimit(namespace: string, key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  prune(now);
  const bucketKey = `${namespace}:${key}`;
  const bucket = buckets.get(bucketKey);
  if (bucket && bucket.resetAt > now && bucket.attempts >= maxAttempts) return false;
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(bucketKey, { attempts: 1, resetAt: now + windowMs });
  } else {
    bucket.attempts += 1;
  }
  return true;
}

export function recordLoginFailure(ip: string, username: string) {
  const now = Date.now();
  prune(now);
  for (const key of [ip, username]) {
    const bucketKey = `login:${key}`;
    const bucket = buckets.get(bucketKey);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(bucketKey, { attempts: 1, resetAt: now + WINDOW_MS });
    } else {
      bucket.attempts += 1;
    }
  }
}

export function clearLoginFailures(ip: string, username: string) {
  buckets.delete(`login:${ip}`);
  buckets.delete(`login:${username}`);
}