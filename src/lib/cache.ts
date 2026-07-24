import type { OptionMap } from "../types";

/**
 * 当前 Worker 实例内的站点设置缓存。
 *
 * 这是普通的模块级内存对象，不使用 Workers Cache API。Worker 实例被回收或
 * 重新启动后对象会自然清空，下一次读取会由调用方从 D1 回填。
 */
export const options_cache: OptionMap = Object.create(null) as OptionMap;

/**
 * 当前 Worker 实例内的后台会话缓存，结构为 { [cookie]: expired }。
 *
 * expired 是会话自身的过期时间，不是缓存 TTL。该对象不设置额外缓存时间。
 */
export const sessions_cache: Record<string, number> = Object.create(
  null,
) as Record<string, number>;

export interface CachedSession {
  expired: number;
}

function hasOwn(object: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export function getCachedOptions(): OptionMap | null {
  const keys = Object.keys(options_cache);
  if (!keys.length) return null;

  for (const key of keys) {
    if (typeof options_cache[key] !== "string") {
      delete options_cache[key];
      return null;
    }
  }

  return { ...options_cache };
}

export function putCachedOptions(options: OptionMap): void {
  for (const key of Object.keys(options_cache)) delete options_cache[key];
  Object.assign(options_cache, options);
}

export function getCachedSession(cookie: string): CachedSession | null {
  if (!hasOwn(sessions_cache, cookie)) return null;

  const expired = sessions_cache[cookie];
  if (!Number.isFinite(expired)) {
    delete sessions_cache[cookie];
    return null;
  }

  return { expired };
}

export function putCachedSession(cookie: string, expired: number): void {
  sessions_cache[cookie] = expired;
}

export function deleteCachedSession(cookie: string): void {
  delete sessions_cache[cookie];
}
