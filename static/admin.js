(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const editor = $("[data-editor]");
  const editorPanel = $("[data-editor-panel]");
  const preview = $("[data-preview]");
  let previewTimer = 0;

  function insertText(before, after = "", placeholder = "") {
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.slice(start, end) || placeholder;
    editor.setRangeText(before + selected + after, start, end, "end");
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    editor.focus();
  }

  function insertRawText(text) {
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.setRangeText(text, start, end, "end");
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    editor.focus();
  }

  async function copyText(text) {
    if (!text) return;
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.append(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    if (!copied) throw new Error("复制失败");
  }

  function showCopied(button) {
    if (!button) return;
    const original = button.textContent;
    button.textContent = "已复制";
    window.setTimeout(() => {
      button.textContent = original;
    }, 1200);
  }

  const actions = {
    bold: () => insertText("**", "**", "粗体文字"),
    italic: () => insertText("*", "*", "斜体文字"),
    heading: () => insertText("## ", "", "标题"),
    quote: () => insertText("> ", "", "引用"),
    ul: () => insertText("- ", "", "列表项"),
    ol: () => insertText("1. ", "", "列表项"),
    code: () => insertText("\n```\n", "\n```\n", "代码"),
    link: () => insertText("[", "](https://)", "链接文字"),
    a: () =>
      insertText('<a href="https://" target="_blank">', "</a>", "链接名称"),
    image: () => insertText("![", "](https://)", "图片描述"),
    more: () => insertText("\n<!-- more -->\n"),
    hr: () => insertText("\n---\n"),
  };

  const fallbackTemplates = {
    image: "![FILE_NAME](RELATIVE_PATH)",
    video:
      '<video controls preload="metadata" src="RELATIVE_PATH">FILE_NAME</video>',
    file: "[FILE_NAME](RELATIVE_PATH)",
  };
  const templateCache = new WeakMap();

  function templatesFor(root, kind) {
    if (!root) return [];
    let templates = templateCache.get(root);
    if (!templates) {
      try {
        const parsed = JSON.parse(root.dataset.attachmentTemplates || "[]");
        templates = Array.isArray(parsed) ? parsed : [];
      } catch {
        templates = [];
      }
      templateCache.set(root, templates);
    }
    return templates.filter(
      (item) => item && item.type === kind && typeof item.template === "string",
    );
  }

  function applyTemplate(template, path, fileName) {
    return String(template)
      .replaceAll("RELATIVE_PATH", path)
      .replaceAll("FILE_NAME", fileName);
  }

  function chooseTemplate(templates, fileName) {
    return new Promise((resolve) => {
      const backdrop = document.createElement("div");
      backdrop.className = "attachment-template-backdrop";
      const dialog = document.createElement("section");
      dialog.className = "attachment-template-dialog";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.innerHTML =
        '<div class="attachment-template-dialog-head"><div><strong>选择附件模板</strong><small></small></div><button type="button" class="attachment-template-close" aria-label="关闭">×</button></div><div class="attachment-template-options"></div>';
      dialog.querySelector("small").textContent = fileName;
      const options = dialog.querySelector(".attachment-template-options");
      templates.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "attachment-template-option";
        const name = document.createElement("strong");
        name.textContent = item.name;
        const code = document.createElement("code");
        code.textContent = item.template;
        button.append(name, code);
        button.addEventListener("click", () => finish(item.template));
        options.append(button);
      });
      backdrop.append(dialog);
      document.body.append(backdrop);
      const finish = (value) => {
        document.removeEventListener("keydown", onKeydown);
        backdrop.remove();
        resolve(value);
      };
      const onKeydown = (event) => {
        if (event.key === "Escape") finish(null);
      };
      document.addEventListener("keydown", onKeydown);
      dialog
        .querySelector(".attachment-template-close")
        .addEventListener("click", () => finish(null));
      backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop) finish(null);
      });
      options.querySelector("button")?.focus();
    });
  }

  async function insertAttachment(trigger) {
    const path = trigger.dataset.attachmentPath || "";
    const fileName = trigger.dataset.attachmentName || "";
    const kind = trigger.dataset.attachmentKind || "file";
    const root = trigger.closest("[data-attachment-list]");
    const configured = templatesFor(root, kind);
    const selectedTemplate = configured.length
      ? await chooseTemplate(configured, fileName)
      : fallbackTemplates[kind] || fallbackTemplates.file;
    if (!selectedTemplate) return;
    const insertion = applyTemplate(selectedTemplate, path, fileName);
    try {
      await copyText(insertion);
      if (editor) insertRawText(insertion);
      showCopied(trigger);
    } catch {
      alert("复制到剪贴板失败");
    }
  }

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-md-action]");
    if (button) {
      event.preventDefault();
      const action = button.dataset.mdAction;
      if (actions[action]) actions[action]();
    }
    if (event.target.closest("[data-fullscreen]")) {
      event.preventDefault();
      editorPanel?.classList.toggle("editor-fullscreen");
    }
    if (event.target.closest("[data-preview-toggle]")) {
      event.preventDefault();
      editorPanel
        ?.querySelector(".editor-workspace")
        ?.classList.toggle("preview-visible");
      renderPreview();
    }
    const insert = event.target.closest("[data-attachment-insert]");
    if (insert) {
      event.preventDefault();
      await insertAttachment(insert);
    }
    const remove = event.target.closest("[data-attachment-delete]");
    if (remove) {
      event.preventDefault();
      if (!confirm("确定删除这个附件及 R2 文件吗？")) return;
      const response = await fetch(
        "/admin/api/attachments/" + remove.dataset.attachmentDelete,
        { method: "DELETE" },
      );
      if (response.ok) remove.closest(".attachment-item")?.remove();
      else alert("删除失败");
    }
  });

  async function renderPreview() {
    if (!editor || !preview) return;
    const workspace = editorPanel?.querySelector(".editor-workspace");
    if (!workspace?.classList.contains("preview-visible")) return;
    const response = await fetch("/admin/api/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editor.value }),
    });
    const data = await response.json();
    preview.innerHTML = data.html || "";
  }
  editor?.addEventListener("input", () => {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(renderPreview, 260);
  });

  const fileInput = $("[data-upload-input]");
  const uploadStatus = $("[data-upload-status]");
  const attachmentList = $("[data-attachment-list]");

  function fileKind(mime) {
    if (mime?.startsWith("image/")) return "image";
    if (mime?.startsWith("video/")) return "video";
    return "file";
  }

  function createAttachmentItem(data) {
    const item = document.createElement("div");
    item.className = "attachment-item";
    item.innerHTML =
      '<div class="attachment-thumb"></div><div><div class="attachment-name"></div><small class="muted"></small></div><div><button type="button" class="button small insert-button" data-attachment-insert>插入</button> <button type="button" class="button small danger delete-button">删除</button></div>';
    item.querySelector(".attachment-name").textContent =
      data.attachment.originalName;
    item.querySelector("small").textContent =
      Math.ceil(data.attachment.size / 1024) + " KB";
    const thumb = item.querySelector(".attachment-thumb");
    if (data.attachment.mime.startsWith("image/")) {
      const image = document.createElement("img");
      image.src = data.attachment.url;
      image.alt = "";
      thumb.append(image);
    } else
      thumb.textContent = data.attachment.mime.startsWith("video/")
        ? "VIDEO"
        : "FILE";
    const insertButton = item.querySelector(".insert-button");
    insertButton.dataset.attachmentPath =
      data.attachment.path || data.attachment.url;
    insertButton.dataset.attachmentName = data.attachment.originalName;
    insertButton.dataset.attachmentKind = fileKind(data.attachment.mime);
    const deleteButton = item.querySelector(".delete-button");
    deleteButton.dataset.attachmentDelete = String(data.attachment.cid);
    deleteButton.setAttribute("data-attachment-delete", "");
    return item;
  }

  function refreshAttachmentList(data) {
    if (!attachmentList) return null;
    const item = createAttachmentItem(data);
    attachmentList.prepend(item);
    return item;
  }

  fileInput?.addEventListener("change", async () => {
    const files = Array.from(fileInput.files || []);
    if (!files.length) return;
    const cid = fileInput.dataset.cid;
    for (const file of files) {
      if (uploadStatus) {
        uploadStatus.style.display = "block";
        uploadStatus.textContent = "正在上传 " + file.name + "…";
      }
      const body = new FormData();
      body.append("file", file);
      body.append("cid", cid || "");
      const response = await fetch("/admin/api/attachments", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "上传失败");
        continue;
      }
      const item = refreshAttachmentList(data);
      if (editor && item)
        await insertAttachment(item.querySelector("[data-attachment-insert]"));
    }
    if (uploadStatus) uploadStatus.textContent = "上传完成";
    fileInput.value = "";
  });

  const coverUpload = $("[data-cover-upload]");
  const coverUrl = $("[data-cover-url]");
  const coverStatus = $("[data-cover-status]");
  coverUpload?.addEventListener("change", async () => {
    const file = coverUpload.files?.[0];
    if (!file) return;
    if (coverStatus) coverStatus.textContent = "正在上传 " + file.name + "…";
    const body = new FormData();
    body.append("file", file);
    body.append("cid", coverUpload.dataset.cid || "");
    try {
      const response = await fetch("/admin/api/attachments", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "上传失败");
      if (coverUrl) {
        coverUrl.value = data.attachment.path || data.attachment.url;
        coverUrl.dispatchEvent(new Event("input", { bubbles: true }));
      }
      refreshAttachmentList(data);
      if (coverStatus)
        coverStatus.textContent =
          "封面上传完成，附件列表已刷新，保存内容后生效。";
    } catch (error) {
      if (coverStatus)
        coverStatus.textContent =
          error instanceof Error ? error.message : "上传失败";
    } finally {
      coverUpload.value = "";
    }
  });

  const tagsRoot = $("[data-tags]");
  if (tagsRoot) {
    const hidden = $("[data-tags-hidden]", tagsRoot);
    const input = $('input[type="text"]', tagsRoot);
    const sync = () => {
      hidden.value = Array.from(tagsRoot.querySelectorAll(".tag-chip span"))
        .map((node) => node.textContent.trim())
        .join(",");
    };
    const add = (name) => {
      name = name.trim();
      if (
        !name ||
        Array.from(tagsRoot.querySelectorAll(".tag-chip span")).some(
          (node) => node.textContent === name,
        )
      )
        return;
      const chip = document.createElement("span");
      chip.className = "tag-chip";
      const label = document.createElement("span");
      label.textContent = name;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "×";
      remove.addEventListener("click", () => {
        chip.remove();
        sync();
      });
      chip.append(label, remove);
      tagsRoot.insertBefore(chip, input);
      sync();
    };
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === ",") {
        event.preventDefault();
        add(input.value.replace(/,$/, ""));
        input.value = "";
      }
      if (event.key === "Backspace" && !input.value)
        tagsRoot.querySelector(".tag-chip:last-of-type button")?.click();
    });
    input.addEventListener("blur", () => {
      add(input.value);
      input.value = "";
    });
    tagsRoot.querySelectorAll(".tag-chip button").forEach((button) =>
      button.addEventListener("click", () => {
        button.parentElement.remove();
        sync();
      }),
    );
    sync();
  }

  async function uploadSingle(input, urlInput, status, successText) {
    const file = input.files?.[0];
    if (!file) return;
    if (status) status.textContent = "正在上传 " + file.name + "…";
    const body = new FormData();
    body.append("file", file);
    try {
      const response = await fetch("/admin/api/attachments", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "上传失败");
      if (urlInput) {
        urlInput.value = data.attachment.path || data.attachment.url;
        urlInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (status) status.textContent = successText;
    } catch (error) {
      if (status)
        status.textContent =
          error instanceof Error ? error.message : "上传失败";
      else alert(error instanceof Error ? error.message : "上传失败");
    } finally {
      input.value = "";
    }
  }

  const iconUpload = $("[data-icon-upload]");
  iconUpload?.addEventListener("change", () =>
    uploadSingle(iconUpload, $("[data-icon-url]"), null, ""),
  );
  const avatarUpload = $("[data-avatar-upload]");
  avatarUpload?.addEventListener("change", () =>
    uploadSingle(
      avatarUpload,
      $("[data-avatar-url]"),
      $("[data-avatar-status]"),
      "头像上传完成，保存设置后生效。",
    ),
  );

  const faviconText = $("[data-favicon-text]");
  const faviconColorText = $("[data-favicon-color-text]");
  const faviconColorPicker = $("[data-favicon-color-picker]");
  const faviconPreview = $("[data-favicon-preview]");
  const validFaviconColor = (value) => /^#[0-9a-f]{6}$/i.test(value);
  const updateFaviconPreview = () => {
    if (!faviconPreview) return;
    faviconPreview.textContent = Array.from(faviconText?.value.trim() || "B")
      .slice(0, 2)
      .join("");
    if (faviconColorText && validFaviconColor(faviconColorText.value.trim()))
      faviconPreview.style.setProperty(
        "--favicon-color",
        faviconColorText.value.trim(),
      );
  };
  faviconText?.addEventListener("input", updateFaviconPreview);
  faviconColorPicker?.addEventListener("input", () => {
    if (faviconColorText)
      faviconColorText.value = faviconColorPicker.value.toUpperCase();
    updateFaviconPreview();
  });
  faviconColorText?.addEventListener("input", () => {
    const value = faviconColorText.value.trim();
    if (faviconColorPicker && validFaviconColor(value))
      faviconColorPicker.value = value;
    updateFaviconPreview();
  });
  updateFaviconPreview();

  const customNavigationList = document.querySelector(
    '[data-navigation-list][data-navigation-section="custom"]',
  );
  const navigationAdd = $("[data-navigation-add]");
  const navigationForm = $("[data-navigation-form]");
  const nextCustomNavigationOrder = () => {
    if (!customNavigationList) return 10;
    const values = Array.from(
      customNavigationList.querySelectorAll('input[name^="nav_order:"]'),
    )
      .map((input) => Number.parseInt(input.value, 10))
      .filter(Number.isFinite);
    return values.length ? Math.max(...values) + 10 : 10;
  };
  const createNavigationRow = () => {
    if (!customNavigationList) return;
    const id = "custom-" + crypto.randomUUID();
    const row = document.createElement("div");
    row.className = "navigation-row navigation-row-custom";
    row.dataset.navigationRow = "";
    row.dataset.navigationId = id;
    row.innerHTML =
      '<input type="hidden" name="nav_id" value="' +
      id +
      '">' +
      '<input type="hidden" name="nav_section:' +
      id +
      '" value="custom">' +
      '<div class="field navigation-order-field"><label>次序</label><input class="input" name="nav_order:' +
      id +
      '" type="number" step="1" value="' +
      nextCustomNavigationOrder() +
      '" required></div>' +
      '<div class="field navigation-name-field"><label>菜单名</label><input class="input" name="nav_name:' +
      id +
      '" value="新菜单" maxlength="40" required></div>' +
      '<div class="field navigation-url-field"><label>页面 URL</label><input class="input" name="nav_url:' +
      id +
      '" value="/post/page" maxlength="1000" required></div>' +
      '<div class="field navigation-template-field"><label>模板</label><select class="select" name="nav_template:' +
      id +
      '"><option value="page" selected>页面</option><option value="about">关于</option></select></div>' +
      '<div class="navigation-visible-field"><label><input type="checkbox" name="nav_visible:' +
      id +
      '" value="true" checked> 显示</label></div>' +
      '<div class="navigation-delete-field"><button class="button small danger" type="button" data-navigation-delete>删除</button></div>';
    customNavigationList.append(row);
    row.querySelector(".navigation-name-field input")?.focus();
  };
  navigationAdd?.addEventListener("click", createNavigationRow);
  customNavigationList?.addEventListener("click", (event) => {
    const remove = event.target.closest("[data-navigation-delete]");
    if (remove) remove.closest("[data-navigation-row]")?.remove();
  });
  navigationForm?.addEventListener("submit", () => {
    navigationForm.querySelectorAll("input:disabled").forEach((input) => {
      if (input.name?.startsWith("nav_visible:")) input.disabled = false;
    });
  });

  document.querySelectorAll("[data-confirm]").forEach((element) =>
    element.addEventListener("click", (event) => {
      if (!confirm(element.dataset.confirm || "确定执行吗？"))
        event.preventDefault();
    }),
  );
})();
