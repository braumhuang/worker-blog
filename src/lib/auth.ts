import type { Context, MiddlewareHandler } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { AppEnv } from "../types";
import { dbFirst, dbRun } from "./db";
import {
  RENEW_BEFORE_SECONDS,
  SESSION_SECONDS,
  constantTimeEqual,
  createSessionToken,
  nowSeconds,
} from "./utils";

export const SESSION_COOKIE = "blog_session";

type SessionRow = { cookie: string; expired: number };

function cookieOptions(c: Context<AppEnv>, maxAge = SESSION_SECONDS) {
  return {
    path: "/",
    httpOnly: true,
    secure: new URL(c.req.url).protocol === "https:",
    sameSite: "Lax" as const,
    maxAge,
  };
}

export async function createAdminSession(c: Context<AppEnv>): Promise<void> {
  const token = createSessionToken();
  const expired = nowSeconds() + SESSION_SECONDS;
  await dbRun(
    c.env.BLOG_DB,
    "INSERT INTO blog_cookies(cookie, expired) VALUES(?, ?)",
    token,
    expired,
  );
  setCookie(c, SESSION_COOKIE, token, cookieOptions(c));
}

export async function destroyAdminSession(c: Context<AppEnv>): Promise<void> {
  const token = getCookie(c, SESSION_COOKIE);
  if (token)
    await dbRun(
      c.env.BLOG_DB,
      "DELETE FROM blog_cookies WHERE cookie = ?",
      token,
    );
  deleteCookie(c, SESSION_COOKIE, {
    path: "/",
    secure: new URL(c.req.url).protocol === "https:",
  });
}

export function verifyCredentials(
  c: Context<AppEnv>,
  name: string,
  password: string,
): boolean {
  return (
    constantTimeEqual(name, c.env.ADMIN_NAME) &&
    constantTimeEqual(password, c.env.ADMIN_PSWD)
  );
}

export const requireAdmin: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE);
  const isApi = c.req.path.startsWith("/admin/api/");
  const reject = () =>
    isApi
      ? c.json({ ok: false, error: "登录已失效" }, 401)
      : c.redirect(`/admin/login?returnTo=${encodeURIComponent(c.req.path)}`);

  if (!token) return reject();

  const row = await dbFirst<SessionRow>(
    c.env.BLOG_DB,
    "SELECT cookie, expired FROM blog_cookies WHERE cookie = ? LIMIT 1",
    token,
  );
  const now = nowSeconds();
  if (!row || row.expired <= now) {
    if (row)
      await dbRun(
        c.env.BLOG_DB,
        "DELETE FROM blog_cookies WHERE cookie = ?",
        token,
      );
    deleteCookie(c, SESSION_COOKIE, {
      path: "/",
      secure: new URL(c.req.url).protocol === "https:",
    });
    return reject();
  }

  c.set("adminSession", token);
  if (row.expired - now <= RENEW_BEFORE_SECONDS) {
    const renewed = now + SESSION_SECONDS;
    await dbRun(
      c.env.BLOG_DB,
      "UPDATE blog_cookies SET expired = ? WHERE cookie = ?",
      renewed,
      token,
    );
    setCookie(c, SESSION_COOKIE, token, cookieOptions(c));
  }

  await next();
};

export const sameOriginOnly: MiddlewareHandler<AppEnv> = async (c, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(c.req.method)) return next();
  const target = new URL(c.req.url);
  const origin = c.req.header("Origin");
  const referer = c.req.header("Referer");
  const validOrigin = origin
    ? origin === target.origin
    : Boolean(referer?.startsWith(`${target.origin}/`));
  if (!validOrigin) return c.json({ ok: false, error: "来源校验失败" }, 403);
  await next();
};
