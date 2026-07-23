export const adminJs = String.raw`
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const editor = $('[data-editor]');
  const editorPanel = $('[data-editor-panel]');
  const preview = $('[data-preview]');
  let previewTimer = 0;

  function insertText(before, after = '', placeholder = '') {
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.slice(start, end) || placeholder;
    editor.setRangeText(before + selected + after, start, end, 'end');
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    editor.focus();
  }

  async function copyText(text) {
    if (!text) return;
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.append(input);
    input.select();
    const copied = document.execCommand('copy');
    input.remove();
    if (!copied) throw new Error('复制失败');
  }

  function showCopied(button) {
    const original = button.textContent;
    button.textContent = '已复制';
    window.setTimeout(() => { button.textContent = original; }, 1200);
  }

  const actions = {
    bold: () => insertText('**', '**', '粗体文字'),
    italic: () => insertText('*', '*', '斜体文字'),
    heading: () => insertText('## ', '', '标题'),
    quote: () => insertText('> ', '', '引用'),
    ul: () => insertText('- ', '', '列表项'),
    ol: () => insertText('1. ', '', '列表项'),
    code: () => insertText('\n${'```'}\n', '\n${'```'}\n', '代码'),
    link: () => insertText('[', '](https://)', '链接文字'),
    image: () => insertText('![', '](https://)', '图片描述'),
    more: () => insertText('\n<!-- more -->\n'),
    hr: () => insertText('\n---\n'),
  };

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-md-action]');
    if (button) {
      event.preventDefault();
      const action = button.dataset.mdAction;
      if (actions[action]) actions[action]();
    }
    if (event.target.closest('[data-fullscreen]')) {
      event.preventDefault();
      editorPanel?.classList.toggle('editor-fullscreen');
    }
    if (event.target.closest('[data-preview-toggle]')) {
      event.preventDefault();
      editorPanel?.querySelector('.editor-workspace')?.classList.toggle('preview-visible');
      renderPreview();
    }
    const insert = event.target.closest('[data-attachment-insert]');
    if (insert) {
      event.preventDefault();
      const insertion = insert.dataset.attachmentInsert || '';
      try {
        await copyText(insertion);
        if (editor) insertText(insertion);
        showCopied(insert);
      } catch {
        alert('复制到剪贴板失败');
      }
    }
    const remove = event.target.closest('[data-attachment-delete]');
    if (remove) {
      event.preventDefault();
      if (!confirm('确定删除这个附件及 R2 文件吗？')) return;
      const response = await fetch('/admin/api/attachments/' + remove.dataset.attachmentDelete, { method: 'DELETE' });
      if (response.ok) remove.closest('.attachment-item')?.remove();
      else alert('删除失败');
    }
  });

  async function renderPreview() {
    if (!editor || !preview) return;
    const workspace = editorPanel?.querySelector('.editor-workspace');
    if (!workspace?.classList.contains('preview-visible')) return;
    const response = await fetch('/admin/api/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editor.value }),
    });
    const data = await response.json();
    preview.innerHTML = data.html || '';
  }
  editor?.addEventListener('input', () => {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(renderPreview, 260);
  });

  const fileInput = $('[data-upload-input]');
  const uploadStatus = $('[data-upload-status]');
  const attachmentList = $('[data-attachment-list]');

  function createAttachmentItem(data) {
    const item = document.createElement('div');
    item.className = 'attachment-item';
    item.innerHTML = '<div class="attachment-thumb"></div><div><div class="attachment-name"></div><small class="muted"></small></div><div><button type="button" class="button small insert-button">插入</button> <button type="button" class="button small danger delete-button">删除</button></div>';
    item.querySelector('.attachment-name').textContent = data.attachment.originalName;
    item.querySelector('small').textContent = Math.ceil(data.attachment.size / 1024) + ' KB';
    const thumb = item.querySelector('.attachment-thumb');
    if (data.attachment.mime.startsWith('image/')) {
      const image = document.createElement('img');
      image.src = data.attachment.url;
      image.alt = '';
      thumb.append(image);
    } else {
      thumb.textContent = data.attachment.mime.startsWith('video/') ? 'VIDEO' : 'FILE';
    }
    const insertButton = item.querySelector('.insert-button');
    insertButton.dataset.attachmentInsert = data.insertion;
    insertButton.setAttribute('data-attachment-insert', '');
    const deleteButton = item.querySelector('.delete-button');
    deleteButton.dataset.attachmentDelete = String(data.attachment.cid);
    deleteButton.setAttribute('data-attachment-delete', '');
    return item;
  }

  function refreshAttachmentList(data) {
    if (!attachmentList) return;
    attachmentList.prepend(createAttachmentItem(data));
  }

  fileInput?.addEventListener('change', async () => {
    const files = Array.from(fileInput.files || []);
    if (!files.length) return;
    const cid = fileInput.dataset.cid;
    for (const file of files) {
      uploadStatus.style.display = 'block';
      uploadStatus.textContent = '正在上传 ' + file.name + '…';
      const body = new FormData();
      body.append('file', file);
      body.append('cid', cid || '');
      const response = await fetch('/admin/api/attachments', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) { alert(data.error || '上传失败'); continue; }
      if (editor) insertText(data.insertion + '\n');
      refreshAttachmentList(data);
    }
    uploadStatus.textContent = '上传完成';
    fileInput.value = '';
  });

  const coverUpload = $('[data-cover-upload]');
  const coverUrl = $('[data-cover-url]');
  const coverStatus = $('[data-cover-status]');
  coverUpload?.addEventListener('change', async () => {
    const file = coverUpload.files?.[0];
    if (!file) return;
    if (coverStatus) coverStatus.textContent = '正在上传 ' + file.name + '…';
    const body = new FormData();
    body.append('file', file);
    body.append('cid', coverUpload.dataset.cid || '');
    try {
      const response = await fetch('/admin/api/attachments', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '上传失败');
      if (coverUrl) {
        coverUrl.value = data.attachment.path || data.attachment.url;
        coverUrl.dispatchEvent(new Event('input', { bubbles: true }));
      }
      refreshAttachmentList(data);
      if (coverStatus) coverStatus.textContent = '封面上传完成，附件列表已刷新，保存内容后生效。';
    } catch (error) {
      if (coverStatus) coverStatus.textContent = error instanceof Error ? error.message : '上传失败';
    } finally {
      coverUpload.value = '';
    }
  });

  const tagsRoot = $('[data-tags]');
  if (tagsRoot) {
    const hidden = $('[data-tags-hidden]', tagsRoot);
    const input = $('input[type="text"]', tagsRoot);
    const sync = () => {
      hidden.value = Array.from(tagsRoot.querySelectorAll('.tag-chip span')).map((node) => node.textContent.trim()).join(',');
    };
    const add = (name) => {
      name = name.trim();
      if (!name || Array.from(tagsRoot.querySelectorAll('.tag-chip span')).some((node) => node.textContent === name)) return;
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      const label = document.createElement('span'); label.textContent = name;
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '×';
      remove.addEventListener('click', () => { chip.remove(); sync(); });
      chip.append(label, remove);
      tagsRoot.insertBefore(chip, input);
      sync();
    };
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); add(input.value.replace(/,$/, '')); input.value = ''; }
      if (event.key === 'Backspace' && !input.value) tagsRoot.querySelector('.tag-chip:last-of-type button')?.click();
    });
    input.addEventListener('blur', () => { add(input.value); input.value = ''; });
    tagsRoot.querySelectorAll('.tag-chip button').forEach((button) => button.addEventListener('click', () => { button.parentElement.remove(); sync(); }));
    sync();
  }

  const iconUpload = $('[data-icon-upload]');
  const iconUrl = $('[data-icon-url]');
  iconUpload?.addEventListener('change', async () => {
    const file = iconUpload.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    const response = await fetch('/admin/api/attachments', { method: 'POST', body });
    const data = await response.json();
    if (!response.ok) { alert(data.error || '上传失败'); return; }
    if (iconUrl) iconUrl.value = data.attachment.path || data.attachment.url;
    iconUpload.value = '';
  });


  const avatarUpload = $('[data-avatar-upload]');
  const avatarUrl = $('[data-avatar-url]');
  const avatarStatus = $('[data-avatar-status]');
  avatarUpload?.addEventListener('change', async () => {
    const file = avatarUpload.files?.[0];
    if (!file) return;
    if (avatarStatus) avatarStatus.textContent = '正在上传 ' + file.name + '…';
    const body = new FormData();
    body.append('file', file);
    try {
      const response = await fetch('/admin/api/attachments', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '上传失败');
      if (avatarUrl) {
        avatarUrl.value = data.attachment.path || data.attachment.url;
        avatarUrl.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (avatarStatus) avatarStatus.textContent = '头像上传完成，保存设置后生效。';
    } catch (error) {
      if (avatarStatus) avatarStatus.textContent = error instanceof Error ? error.message : '上传失败';
    } finally {
      avatarUpload.value = '';
    }
  });

  const faviconText = $('[data-favicon-text]');
  const faviconColorText = $('[data-favicon-color-text]');
  const faviconColorPicker = $('[data-favicon-color-picker]');
  const faviconPreview = $('[data-favicon-preview]');
  const validFaviconColor = (value) => /^#[0-9a-f]{6}$/i.test(value);
  const updateFaviconPreview = () => {
    if (!faviconPreview) return;
    faviconPreview.textContent = Array.from(faviconText?.value.trim() || 'B').slice(0, 2).join('');
    if (faviconColorText && validFaviconColor(faviconColorText.value.trim())) {
      faviconPreview.style.setProperty('--favicon-color', faviconColorText.value.trim());
    }
  };
  faviconText?.addEventListener('input', updateFaviconPreview);
  faviconColorPicker?.addEventListener('input', () => {
    if (faviconColorText) faviconColorText.value = faviconColorPicker.value.toUpperCase();
    updateFaviconPreview();
  });
  faviconColorText?.addEventListener('input', () => {
    const value = faviconColorText.value.trim();
    if (faviconColorPicker && validFaviconColor(value)) faviconColorPicker.value = value;
    updateFaviconPreview();
  });
  updateFaviconPreview();

  const customNavigationList = document.querySelector('[data-navigation-list][data-navigation-section="custom"]');
  const navigationAdd = $('[data-navigation-add]');
  const navigationForm = $('[data-navigation-form]');

  const nextCustomNavigationOrder = () => {
    if (!customNavigationList) return 10;
    const values = Array.from(customNavigationList.querySelectorAll('input[name^="nav_order:"]'))
      .map((input) => Number.parseInt(input.value, 10))
      .filter(Number.isFinite);
    return values.length ? Math.max(...values) + 10 : 10;
  };

  const createNavigationRow = () => {
    if (!customNavigationList) return;
    const id = 'custom-' + crypto.randomUUID();
    const row = document.createElement('div');
    row.className = 'navigation-row navigation-row-custom';
    row.dataset.navigationRow = '';
    row.dataset.navigationId = id;
    row.innerHTML =
      '<input type="hidden" name="nav_id" value="' + id + '">' +
      '<input type="hidden" name="nav_section:' + id + '" value="custom">' +
      '<div class="field navigation-order-field"><label>次序</label><input class="input" name="nav_order:' + id + '" type="number" step="1" value="' + nextCustomNavigationOrder() + '" required></div>' +
      '<div class="field navigation-name-field"><label>菜单名</label><input class="input" name="nav_name:' + id + '" value="新菜单" maxlength="40" required></div>' +
      '<div class="field navigation-url-field"><label>页面 URL</label><input class="input" name="nav_url:' + id + '" value="/post/page" maxlength="1000" required></div>' +
      '<div class="field navigation-template-field"><label>模板</label><select class="select" name="nav_template:' + id + '"><option value="page" selected>页面</option><option value="about">关于</option></select></div>' +
      '<div class="navigation-visible-field"><label><input type="checkbox" name="nav_visible:' + id + '" value="true" checked> 显示</label></div>' +
      '<div class="navigation-delete-field"><button class="button small danger" type="button" data-navigation-delete>删除</button></div>';
    customNavigationList.append(row);
    row.querySelector('.navigation-name-field input')?.focus();
  };

  navigationAdd?.addEventListener('click', createNavigationRow);
  customNavigationList?.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-navigation-delete]');
    if (!remove) return;
    remove.closest('[data-navigation-row]')?.remove();
  });

  navigationForm?.addEventListener('submit', () => {
    navigationForm.querySelectorAll('input:disabled').forEach((input) => {
      if (input.name?.startsWith('nav_visible:')) input.disabled = false;
    });
  });

  document.querySelectorAll('[data-confirm]').forEach((element) => element.addEventListener('click', (event) => {
    if (!confirm(element.dataset.confirm || '确定执行吗？')) event.preventDefault();
  }));
})();
`
