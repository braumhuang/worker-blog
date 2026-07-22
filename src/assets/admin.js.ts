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
      insertText(insert.dataset.attachmentInsert || '');
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
      insertText(data.insertion + '\n');
      if (attachmentList) {
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
        attachmentList.prepend(item);
      }
    }
    uploadStatus.textContent = '上传完成';
    fileInput.value = '';
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
    if (iconUrl) iconUrl.value = data.attachment.url;
    iconUpload.value = '';
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

  document.querySelectorAll('[data-confirm]').forEach((element) => element.addEventListener('click', (event) => {
    if (!confirm(element.dataset.confirm || '确定执行吗？')) event.preventDefault();
  }));
})();
`
