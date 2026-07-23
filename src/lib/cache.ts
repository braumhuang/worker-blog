import type { OptionMap } from "../types";

const OPTIONS_CACHE_NAME = "options_cache";
const SESSIONS_CACHE_NAME = "sessions_cache";
const OPTIONS_CACHE_KEY = new Request(
  "https://worker-blog-cache.invalid/options/v1",
);
const OPTIONS_CACHE_SECONDS = 5 * 60;
const SESSION_CACHE_SECONDS = 5 * 60;

export interface CachedSession {
  expired: number;
}

async function openCache(name: string): Promise<Cache | null> {
  try {
    return await caches.open(name);
  } catch {
    return null;
  }
}

async function readJson<T>(cache: Cache, key: Request): Promise<T | null> {
  try {
    const response = await cache.match(key);
    if (!response) return null;
    return (await response.json()) as T;
  } catch {
    await cache.delete(key).catch(() => false);
    return null;
  }
}

async function putJson(
  cache: Cache,
  key: Request,
  value: unknown,
  maxAge: number,
): Promise<void> {
  if (maxAge <= 0) {
    await cache.delete(key).catch(() => false);
    return;
  }
  const response = new Response(JSON.stringify(value), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `public, max-age=${Math.floor(maxAge)}`,
    },
  });
  await cache.put(key, response).catch(() => undefined);
}

async function sessionCacheKey(token: string): Promise<Request> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return new Request(`https://worker-blog-cache.invalid/sessions/${hash}`);
}

export async function getCachedOptions(): Promise<OptionMap | null> {
  const cache = await openCache(OPTIONS_CACHE_NAME);
  if (!cache) return null;
  const value = await readJson<unknown>(cache, OPTIONS_CACHE_KEY);
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    !Object.values(value).every((item) => typeof item === "string")
  ) {
    if (value !== null)
      await cache.delete(OPTIONS_CACHE_KEY).catch(() => false);
    return null;
  }
  return value as OptionMap;
}

export async function putCachedOptions(options: OptionMap): Promise<void> {
  const cache = await openCache(OPTIONS_CACHE_NAME);
  if (cache)
    await putJson(cache, OPTIONS_CACHE_KEY, options, OPTIONS_CACHE_SECONDS);
}

export async function invalidateOptionsCache(): Promise<void> {
  const cache = await openCache(OPTIONS_CACHE_NAME);
  if (cache) await cache.delete(OPTIONS_CACHE_KEY).catch(() => false);
}

export async function getCachedSession(
  token: string,
): Promise<CachedSession | null> {
  const cache = await openCache(SESSIONS_CACHE_NAME);
  if (!cache) return null;
  const key = await sessionCacheKey(token);
  const value = await readJson<unknown>(cache, key);
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    !Number.isFinite((value as Record<string, unknown>).expired)
  ) {
    if (value !== null) await cache.delete(key).catch(() => false);
    return null;
  }
  return { expired: Number((value as Record<string, unknown>).expired) };
}

export async function putCachedSession(
  token: string,
  expired: number,
  now: number,
): Promise<void> {
  const cache = await openCache(SESSIONS_CACHE_NAME);
  if (!cache) return;
  const ttl = Math.min(SESSION_CACHE_SECONDS, expired - now);
  await putJson(cache, await sessionCacheKey(token), { expired }, ttl);
}

export async function invalidateSessionCache(token: string): Promise<void> {
  const cache = await openCache(SESSIONS_CACHE_NAME);
  if (cache)
    await cache.delete(await sessionCacheKey(token)).catch(() => false);
}
