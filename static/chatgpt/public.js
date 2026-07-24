(function(){
  'use strict';
  var html=document.documentElement, body=document.body;
  function one(s,r){return (r||document).querySelector(s)}
  function all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

  all('[data-variants]').forEach(function(el){
    var variants=(el.getAttribute('data-variants')||'').split('\n').map(function(v){return v.trim()}).filter(Boolean);
    if(!variants.length)return;
    var value=variants[Math.floor(Math.random()*variants.length)];
    value=value.replace(/\{name\}/g,el.getAttribute('data-name')||'').replace(/\{count\}/g,el.getAttribute('data-count')||'');
    el.textContent=value;
  });

  function setTheme(mode){
    html.setAttribute('data-theme',mode==='dark'?'dark':'light');
    try{localStorage.setItem('chatgpt-theme',mode)}catch(e){}
  }
  var themeToggle=one('#theme-toggle');
  if(themeToggle)themeToggle.addEventListener('click',function(){setTheme(html.getAttribute('data-theme')==='dark'?'light':'dark')});

  var sidebar=one('#sidebar'), overlay=one('#sidebar-overlay'), openBtn=one('#sidebar-open'), closeBtn=one('#sidebar-close');
  function mobile(){return matchMedia('(max-width: 900px)').matches}
  function openSidebar(){body.classList.add('sidebar-open')}
  function closeSidebar(){body.classList.remove('sidebar-open')}
  if(openBtn)openBtn.addEventListener('click',function(){
    if(mobile())openSidebar();
    else{html.classList.remove('sidebar-collapsed');try{localStorage.setItem('chatgpt-sidebar','open')}catch(e){}}
  });
  if(closeBtn)closeBtn.addEventListener('click',function(){
    if(mobile())closeSidebar();
    else{html.classList.add('sidebar-collapsed');try{localStorage.setItem('chatgpt-sidebar','closed')}catch(e){}}
  });
  if(overlay)overlay.addEventListener('click',closeSidebar);
  all('.sidebar__nav-item').forEach(function(a){a.addEventListener('click',function(){if(mobile())closeSidebar()})});

  var userBtn=one('#sidebar-user'), userMenu=one('#user-menu');
  function closeUser(){if(userMenu)userMenu.hidden=true;if(userBtn)userBtn.setAttribute('aria-expanded','false')}
  if(userBtn&&userMenu)userBtn.addEventListener('click',function(e){e.stopPropagation();var next=!userMenu.hidden;userMenu.hidden=next;userBtn.setAttribute('aria-expanded',String(!next))});
  document.addEventListener('click',function(e){if(userMenu&&!userMenu.hidden&&!userMenu.contains(e.target)&&e.target!==userBtn)closeUser()});

  function api(query){
    var url=query?'/api/search?q='+encodeURIComponent(query):'/api/search?recent=1';
    return fetch(url,{headers:{Accept:'application/json'}}).then(function(r){if(!r.ok)throw new Error(String(r.status));return r.json()}).then(function(d){return d.items||[]}).catch(function(){return []});
  }
  api('').then(function(items){
    var list=one('#sidebar-recent-list');
    if(list){list.innerHTML='';items.slice(0,20).forEach(function(item){var li=document.createElement('li'),a=document.createElement('a');a.href=item.url;a.textContent=item.title||'未命名';if(location.pathname===new URL(a.href,location.origin).pathname)a.className='is-active';li.appendChild(a);list.appendChild(li)})}
  });

  var searchOverlay=one('#search-overlay'), searchInput=one('#search-modal-input'), searchResults=one('#search-modal-results'), searchOpen=one('#sidebar-search'), searchClose=one('#search-modal-close'), timer;
  function renderSearch(items,q){
    if(!searchResults)return;
    if(!items.length){searchResults.innerHTML='<div class="search-modal__msg">'+(q?'没有找到与「'+esc(q)+'」相关的内容':'暂无可搜索的内容')+'</div>';return}
    var out='<div class="search-modal__section">'+(q?items.length+' 条结果':'最近发布')+'</div>';
    items.forEach(function(item){out+='<a class="search-modal-hit" href="'+esc(item.url)+'"><span class="search-modal-hit__title">'+esc(item.title||'未命名')+'</span>'+(item.excerpt?'<span class="search-modal-hit__snippet">'+esc(item.excerpt)+'</span>':'')+(item.date?'<span class="search-modal-hit__date">'+esc(item.date)+'</span>':'')+'</a>'});
    searchResults.innerHTML=out;
  }
  function openSearch(){if(!searchOverlay)return;searchOverlay.hidden=false;body.classList.add('no-scroll');if(searchInput){searchInput.value='';searchInput.focus()}api('').then(function(x){renderSearch(x.slice(0,8),'')})}
  function closeSearch(){if(!searchOverlay)return;searchOverlay.hidden=true;body.classList.remove('no-scroll')}
  if(searchOpen)searchOpen.addEventListener('click',openSearch);
  if(searchClose)searchClose.addEventListener('click',closeSearch);
  if(searchOverlay)searchOverlay.addEventListener('click',function(e){if(e.target===searchOverlay)closeSearch()});
  document.addEventListener('keydown',function(e){if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();searchOverlay&&searchOverlay.hidden?openSearch():closeSearch()}if(e.key==='Escape')closeSearch()});
  if(searchInput)searchInput.addEventListener('input',function(){clearTimeout(timer);var q=searchInput.value.trim();timer=setTimeout(function(){api(q).then(function(x){renderSearch(x,q)})},180)});

  var composer=one('#composer'), composerInput=one('#composer-input'), thread=one('#chat-thread');
  if(composer&&composerInput&&thread)composer.addEventListener('submit',function(e){
    e.preventDefault();var q=composerInput.value.trim();if(!q)return;composerInput.value='';
    var user=document.createElement('div');user.className='msg msg--user search-result';user.innerHTML='<div class="msg__bubble">'+esc(q)+'</div>';thread.appendChild(user);
    var answer=document.createElement('div');answer.className='msg msg--assistant search-result';answer.innerHTML='<div class="msg__body"><div class="typing"><i></i><i></i><i></i></div></div>';thread.appendChild(answer);user.scrollIntoView({behavior:'smooth',block:'start'});
    api(q).then(function(items){var out='<div class="msg__text"><p>'+(items.length?'为你找到 <strong>'+items.length+'</strong> 条相关内容：':'翻遍了记忆，也没有找到与「'+esc(q)+'」相关的内容。')+'</p></div>';if(items.length){out+='<div class="search-result__hits">';items.slice(0,10).forEach(function(item){out+='<a class="search-hit" href="'+esc(item.url)+'"><span class="search-hit__title">'+esc(item.title)+'</span><span class="search-hit__snippet">'+esc(item.excerpt||'')+'</span></a>'});out+='</div>'}out+='<button class="search-clear" type="button">清除搜索记录</button>';answer.querySelector('.msg__body').innerHTML=out;answer.querySelector('.search-clear').addEventListener('click',function(){all('.search-result').forEach(function(n){n.remove()})})})
  });

  function copy(text){return navigator.clipboard?navigator.clipboard.writeText(text):Promise.resolve()}
  all('.article-content pre').forEach(function(pre){
    var code=one('code',pre);if(!code)return;
    var lang=(code.className.match(/language-([\w-]+)/)||[])[1]||'code';var label=document.createElement('span');label.className='codeblock-lang';label.textContent=lang;pre.appendChild(label);
    var btn=document.createElement('button');btn.type='button';btn.className='codeblock-copy';btn.textContent='复制';btn.addEventListener('click',function(){copy(code.textContent||'').then(function(){btn.textContent='已复制';setTimeout(function(){btn.textContent='复制'},1200)})});pre.appendChild(btn)
  });
  var copyLink=one('#copy-link'),copyText=one('#copy-text'),goTop=one('#go-top');
  if(copyLink)copyLink.addEventListener('click',function(){copy(location.href);copyLink.classList.add('is-done');setTimeout(function(){copyLink.classList.remove('is-done')},1200)});
  if(copyText)copyText.addEventListener('click',function(){var article=one('.article-content');copy(article?article.innerText:'');copyText.classList.add('is-done');setTimeout(function(){copyText.classList.remove('is-done')},1200)});
  if(goTop)goTop.addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'})});

  var progress=one('#cg-reading-progress');
  function syncProgress(){if(!progress)return;var max=document.documentElement.scrollHeight-innerHeight;progress.style.transform='scaleX('+(max>0?Math.min(1,scrollY/max):0)+')'}
  addEventListener('scroll',syncProgress,{passive:true});syncProgress();

  all('.cg-comment-form').forEach(function(form){form.addEventListener('submit',function(e){
    if(!window.fetch)return;e.preventDefault();var btn=one('button[type="submit"]',form),section=one('#comments');if(btn){btn.disabled=true;btn.textContent='提交中…'}
    fetch(form.action,{method:'POST',body:new FormData(form),headers:{'X-Requested-With':'comments'}}).then(function(r){if(!r.ok)return r.text().then(function(t){throw new Error(t)});return r.text()}).then(function(markup){var temp=document.createElement('div');temp.innerHTML=markup;var next=one('#comments',temp);if(next&&section)section.replaceWith(next);location.hash='comments';location.reload()}).catch(function(err){alert(err.message||'评论提交失败');if(btn){btn.disabled=false;btn.textContent='发表评论'}})
  })});
})();
