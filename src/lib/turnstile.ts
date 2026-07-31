import type { OptionMap } from "../types";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const COMMENT_ACTION = "comment";
const ALWAYS_PASS_TEST_SECRET = "1x0000000000000000000000000000000AA";

interface TurnstileSiteverifyResponse {
  success: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export function turnstileEnabled(options: OptionMap): boolean {
  return Boolean(
    (options.turnstile_site_key || "").trim() &&
    (options.turnstile_secret_key || "").trim(),
  );
}

export async function verifyCommentTurnstile({
  secret,
  token,
  remoteIp,
}: {
  secret: string;
  token: string;
  remoteIp?: string;
}): Promise<boolean> {
  const normalizedSecret = secret.trim();
  const normalizedToken = token.trim();
  if (!normalizedSecret || !normalizedToken || normalizedToken.length > 2048)
    return false;

  const body = new URLSearchParams({
    secret: normalizedSecret,
    response: normalizedToken,
  });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error("Turnstile Siteverify 请求失败。", response.status);
      return false;
    }

    const result = await response.json<TurnstileSiteverifyResponse>();
    if (!result.success) {
      console.warn(
        "Turnstile 验证未通过。",
        result["error-codes"]?.join(", ") || "unknown-error",
      );
      return false;
    }

    // Cloudflare 的官方测试私密密钥只接受 dummy token，并固定返回
    // success=true。文档示例中的 action 是 "test"，但部分本地测试
    // 响应可能不包含 action，因此仅对这一把精确匹配的测试密钥
    // 跳过额外的 action 校验。真实密钥仍必须严格匹配 comment。
    const isAlwaysPassTestSecret = normalizedSecret === ALWAYS_PASS_TEST_SECRET;
    if (!isAlwaysPassTestSecret && result.action !== COMMENT_ACTION) {
      console.warn(
        "Turnstile action 不匹配。",
        `expected=${COMMENT_ACTION}`,
        `received=${result.action || "empty"}`,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Turnstile Siteverify 请求异常。", error);
    return false;
  }
}
