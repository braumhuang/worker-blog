(function () {
  "use strict";

  const API_ID = "worker-blog-turnstile-api";
  const API_URL =
    "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  const states = new WeakMap();
  let apiPromise;

  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (apiPromise) return apiPromise;

    apiPromise = new Promise(function (resolve, reject) {
      let script = document.getElementById(API_ID);
      let settled = false;
      const timer = setTimeout(function () {
        fail("Turnstile API 加载超时。");
      }, 15000);

      function finish() {
        if (settled) return;
        if (!window.turnstile) {
          fail("Turnstile API 未能初始化。");
          return;
        }
        settled = true;
        clearTimeout(timer);
        resolve(window.turnstile);
      }

      function fail(message) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(new Error(message));
      }

      if (script) {
        script.addEventListener("load", finish, { once: true });
        script.addEventListener(
          "error",
          function () {
            fail("Turnstile API 加载失败。");
          },
          { once: true },
        );
        return;
      }

      script = document.createElement("script");
      script.id = API_ID;
      script.src = API_URL;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", finish, { once: true });
      script.addEventListener(
        "error",
        function () {
          fail("Turnstile API 加载失败。");
        },
        { once: true },
      );
      document.head.appendChild(script);
    }).catch(function (error) {
      apiPromise = undefined;
      throw error;
    });

    return apiPromise;
  }

  function submitButton(form, event) {
    if (event.submitter instanceof HTMLButtonElement) return event.submitter;
    return form.querySelector('button[type="submit"], input[type="submit"]');
  }

  function setButtonState(state, text, disabled) {
    const button = state.button;
    if (!button) return;
    button.disabled = disabled;
    if (button instanceof HTMLInputElement) button.value = text;
    else button.textContent = text;
  }

  function restoreButton(state) {
    const button = state.button;
    if (!button) return;
    button.disabled = false;
    if (button instanceof HTMLInputElement) button.value = state.buttonText;
    else button.textContent = state.buttonText;
  }

  function errorMessage(error) {
    if (error instanceof Error && error.message) return error.message;
    return "人机验证失败，请稍后重试。";
  }

  function disposeState(form, state, turnstile) {
    state.running = false;
    state.response.value = "";
    if (state.widgetId !== undefined) {
      try {
        turnstile.remove(state.widgetId);
      } catch (_error) {
        // 组件可能尚未完成渲染。
      }
    }
    state.container.replaceChildren();
    states.delete(form);
  }

  async function replaceComments(response) {
    const html = await response.text();
    if (!response.ok) {
      throw new Error(html.trim() || "评论提交失败，请稍后重试。");
    }

    const parsed = new DOMParser().parseFromString(html, "text/html");
    const next = parsed.querySelector("#comments");
    const current = document.querySelector("#comments");
    if (!next || !current) throw new Error("评论区域更新失败，请刷新页面。");

    current.replaceWith(next);
    const url = new URL(window.location.href);
    url.searchParams.delete("comment_page");
    url.searchParams.set("comment", "saved");
    url.hash = "comments";
    history.replaceState(null, "", url);
    document.querySelector("#comments")?.scrollIntoView({ block: "start" });
  }

  async function submitVerified(form, state, turnstile, token) {
    if (state.submitting) return;
    state.submitting = true;
    state.response.value = token;
    setButtonState(state, "正在提交…", true);

    try {
      const response = await fetch(form.action, {
        method: (form.method || "post").toUpperCase(),
        body: new FormData(form),
        headers: { "X-Requested-With": "comments" },
      });
      await replaceComments(response);
      try {
        turnstile.remove(state.widgetId);
      } catch (_error) {
        // 评论区域已经替换，旧组件无需继续保留。
      }
    } catch (error) {
      disposeState(form, state, turnstile);
      restoreButton(state);
      window.alert(errorMessage(error));
    }
  }

  async function executeTurnstile(form, event) {
    let state = states.get(form);
    if (state?.running) return;

    const sitekey = form.dataset.turnstileSitekey;
    const container = form.querySelector("[data-turnstile-container]");
    const response = form.querySelector("[data-turnstile-response]");
    if (!sitekey || !(container instanceof HTMLElement)) return;
    if (!(response instanceof HTMLInputElement)) return;

    const button = submitButton(form, event);
    state = {
      button,
      buttonText:
        button instanceof HTMLInputElement
          ? button.value
          : button?.textContent || "发表评论",
      response,
      container,
      running: true,
      submitting: false,
      widgetId: undefined,
    };
    states.set(form, state);
    setButtonState(state, "正在验证…", true);

    try {
      const turnstile = await loadTurnstile();
      state.widgetId = turnstile.render(container, {
        sitekey,
        action: "comment",
        execution: "execute",
        appearance: "interaction-only",
        size: "flexible",
        theme: "auto",
        "response-field": false,
        callback: function (token) {
          void submitVerified(form, state, turnstile, token);
        },
        "expired-callback": function () {
          state.response.value = "";
        },
        "error-callback": function () {
          disposeState(form, state, turnstile);
          restoreButton(state);
          window.alert("人机验证失败，请重试。");
        },
        "timeout-callback": function () {
          disposeState(form, state, turnstile);
          restoreButton(state);
          window.alert("人机验证已超时，请重试。");
        },
      });
      turnstile.execute(state.widgetId);
    } catch (error) {
      state.running = false;
      state.container.replaceChildren();
      states.delete(form);
      restoreButton(state);
      window.alert(errorMessage(error));
    }
  }

  document.addEventListener(
    "submit",
    function (event) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (!form.matches("[data-comment-form][data-turnstile-sitekey]")) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      if (!form.reportValidity()) return;
      void executeTurnstile(form, event);
    },
    true,
  );
})();
