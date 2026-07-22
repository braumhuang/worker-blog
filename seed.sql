-- Generated from winston.ink static-site resources.
-- Development/mock data only. Re-running this file resets all blog data.
PRAGMA foreign_keys = ON;

DELETE FROM blog_relationships;
DELETE FROM blog_cookies;
DELETE FROM blog_links;
DELETE FROM blog_metas;
DELETE FROM blog_contents;
DELETE FROM blog_options;
DELETE FROM sqlite_sequence WHERE name IN ('blog_contents','blog_metas','blog_links');

INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(1,'R2-Explorer','r2-explorer',1783166400,1783166400,'<p><a href="https://r2explorer.com">R2-Explorer</a> 是一款开源、部署于 Cloudflare Workers 的网页端管理面板，专为 Cloudflare R2 对象存储打造，提供类谷歌网盘可视化操作界面，解决原生R2控制台操作繁琐、缺乏直观文件管理的痛点。项目依托无服务架构，通过GitHub Actions一键自动部署，支持绑定自定义域名独立访问，可单桶或多桶统一管控。</p>
<!-- more -->
<p>工具支持拖拽上传、文件夹管理、多格式文件在线预览、生成带时效/密码的分享链接，可自由切换只读/读写模式。内置基础账号认证、Cloudflare Access双重安全防护，可单独配置桶对外公开直链域名。无需服务器、零存储费用，适合个人图床、文件存储、轻量资源库场景，配置灵活轻量化，适配各类自建R2存储使用需求。</p>
<p>示例参数：</p>
<ul>
<li>Worker 名称：<code>disk</code></li>
<li>R2 桶名称：<code>file</code></li>
<li>Worker 域名：<code>disk.winston.ink</code></li>
<li>文件公开地址：<code>https://file.winston.ink</code></li>
</ul>
<h2 id="heading">一、配置区分说明</h2>
<p>配置分为两类，都在仓库页面操作：</p>
<ol>
<li><strong>Secrets（机密加密存储）</strong>：仓库 → Settings → Secrets and variables → Actions → New repository secret</li>
<li><strong>Variables（明文配置）</strong>：同一页面切换至 Variables 标签添加</li>
</ol>
<h2 id="-secret-">二、必填 Secret 配置</h2>
<p>仅需1个加密密钥，填入 Secrets：</p>
<table>
<thead>
<tr>
<th>Secret 名称</th>
<th>填写内容说明</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>CF_API_TOKEN</code></td>
<td>Cloudflare API Token</td>
</tr>
</tbody>
</table>
<h3 id="token-">Token 创建步骤</h3>
<p>Cloudflare 控制台 → 右上角头像 → My Profile → API Tokens → Create Token<br/>
自定义权限模板，授予：Workers 编辑、R2 读写、Zone DNS 管理权限</p>
<h2 id="github-actions--variables-">三、GitHub Actions 明文 Variables 配置</h2>
<p>共4项核心变量，直接复制对应值填入：</p>
<ol>
<li><code>R2EXPLORER_WORKER_NAME</code><br/>
值：<code>disk</code><br/>
说明：Cloudflare Worker 服务名称</li>
<li><code>R2EXPLORER_BUCKETS</code><br/>
值：<code>disk:file</code><br/>
格式规则：<code>R2绑定名:R2桶真实名称</code>
<ul>
<li><code>disk</code>：wrangler 中 R2 binding 绑定名</li>
<li><code>file</code>：R2 存储桶真实名称</li>
</ul>
</li>
<li><code>R2EXPLORER_DOMAIN</code><br/>
值：<code>disk.winston.ink</code><br/>
说明：绑定 Worker 的自定义访问域名</li>
<li><code>R2EXPLORER_CONFIG</code><br/>
基础完整配置（可直接复制）：
<pre><code class="language-json">{
  "readonly": false,
  "buckets": {
    "disk": {
      "publicUrl": "https://file.winston.ink"
    }
  }
}
</code></pre>
参数释义：
<ul>
<li><code>readonly: false</code>：开启上传、删除等写入操作；改为 <code>true</code> 则全局只读</li>
<li><code>buckets.disk.publicUrl</code>：R2 文件直链访问域名</li>
</ul>
</li>
</ol>
<h3 id="heading-1">带登录密码扩展配置（可选）</h3>
<p>如需开启后台账号密码验证，替换上面的 JSON：</p>
<pre><code class="language-json">{
  "readonly": false,
  "basicAuth": {
    "username": "admin",
    "password": "自定义登录密码"
  },
  "buckets": {
    "disk": {
      "publicUrl": "https://file.winston.ink"
    }
  }
}
</code></pre>
<h2 id="heading-2">四、完整配置汇总表</h2>
<h3 id="1-repository-variables">1. Repository Variables（明文）</h3>
<table>
<thead>
<tr>
<th>变量名</th>
<th>填入值</th>
</tr>
</thead>
<tbody>
<tr>
<td>R2EXPLORER_WORKER_NAME</td>
<td>disk</td>
</tr>
<tr>
<td>R2EXPLORER_BUCKETS</td>
<td>disk:file</td>
</tr>
<tr>
<td>R2EXPLORER_DOMAIN</td>
<td>disk.winston.ink</td>
</tr>
<tr>
<td>R2EXPLORER_CONFIG</td>
<td><code>{"readonly":false,"buckets":{"disk":{"publicUrl":"https://file.winston.ink"}}}</code></td>
</tr>
</tbody>
</table>
<h3 id="2-repository-secrets">2. Repository Secrets（加密密钥）</h3>
<table>
<thead>
<tr>
<th>Secret 名称</th>
<th>值</th>
</tr>
</thead>
<tbody>
<tr>
<td>CF_API_TOKEN</td>
<td>你的 Cloudflare API Token</td>
</tr>
</tbody>
</table>
<h2 id="heading-3">五、部署后域名绑定操作</h2>
<ol>
<li>Actions 自动部署名称为 <code>disk</code> 的 Worker</li>
<li>Cloudflare Worker 设置 → Custom Domains，添加域名 <code>disk.winston.ink</code></li>
<li>R2 桶 <code>file</code> 后台开启公开访问，并绑定域名 <code>https://file.winston.ink</code>，用于文件直链访问</li>
</ol>
<h2 id="heading-4">六、常见问题排查</h2>
<ol>
<li>无法读取桶文件：检查 <code>R2EXPLORER_BUCKETS</code> 格式 <code>绑定名:桶名</code> 是否填写正确</li>
<li>文件直链404：确认 R2 桶已开启公开访问权限，<code>publicUrl</code> 域名解析正常</li>
<li>Actions 部署失败：检查 <code>CF_API_TOKEN</code> 权限是否包含 Workers、R2、DNS 操作权限</li>
</ol>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(2,'Markdown常用语法','markdown',1781784000,1781784000,'<p>适合：日常笔记、背诵、快速查阅、通用所有MD编辑器</p>
<!-- more -->
<h2 id="1-1-6">1. 标题（1-6级）</h2>
<p>语法：# 数量代表标题层级</p>
<pre><code class="language-Plain"># 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
</code></pre>
<h2 id="2-">2. 基础文本样式</h2>
<pre><code class="language-Plain">**加粗**
*斜体*
***加粗斜体***
~~删除线~~
==高亮==
`行内代码`
&lt;u&gt;下划线&lt;/u&gt;
</code></pre>
<h2 id="3---">3. 换行 &amp; 分割线</h2>
<ul>
<li>
<p><strong>分段</strong>：空一行</p>
</li>
<li>
<p><strong>强制换行</strong>：行尾两个空格+回车</p>
</li>
<li>
<p><strong>分割线</strong>：<code>---</code> / <code>***</code></p>
</li>
</ul>
<h2 id="4-">4. 列表</h2>
<h3 id="heading">无序列表</h3>
<pre><code class="language-Plain">- 项目1
- 项目2
  - 子项目
</code></pre>
<h3 id="heading-1">有序列表</h3>
<pre><code class="language-Plain">1. 第一条
2. 第二条
   1. 子条目
</code></pre>
<h3 id="heading-2">任务清单</h3>
<pre><code class="language-Plain">- [ ] 未完成
- [x] 已完成
</code></pre>
<h2 id="5-">5. 引用</h2>
<pre><code class="language-Plain">&gt; 一级引用
&gt;&gt; 嵌套二级引用
</code></pre>
<h2 id="6-">6. 代码块</h2>
<h3 id="heading-3">行内代码</h3>
<pre><code class="language-Plain">  `代码内容`
</code></pre>
<h3 id="heading-4">多行带高亮代码</h3>
<pre><code class="language-Plain">  ```python
  # 指定语言：python / java / sql / bash
  print("hello")
  ```
</code></pre>
<h2 id="7-">7. 链接、图片</h2>
<h3 id="heading-5">超链接</h3>
<pre><code class="language-Plain">[显示文字](链接地址)
</code></pre>
<h3 id="heading-6">图片</h3>
<pre><code class="language-Plain">![图片备注](图片地址)
</code></pre>
<h2 id="8-">8. 表格（最常用）</h2>
<pre><code class="language-Plain">| 姓名 | 年龄 | 职业 |
| ---- | ---- | ---- |
| 张三 | 20   | 学生 |

# 对齐格式
| 左对齐 | 居中 | 右对齐 |
| :----- | :---: | -----: |

</code></pre>
<h2 id="9-">9. 目录</h2>
<p>文档顶部输入，自动生成全文目录</p>
<pre><code class="language-Plain">[TOC]
</code></pre>
<h2 id="10-">10. 折叠块（笔记神器）</h2>
<p>收纳大量内容，默认折叠</p>
<pre><code class="language-Plain">&lt;details&gt;
&lt;summary&gt;点击展开&lt;/summary&gt;
隐藏的内容、列表、表格
&lt;/details&gt;
</code></pre>
<h2 id="11-">11. 提示块（高亮备注）</h2>
<pre><code class="language-Plain">&gt; [!NOTE] 提示
&gt; 普通说明文字

&gt; [!WARNING] 警告
&gt; 注意事项
</code></pre>
<h2 id="12-">12. 转义字符</h2>
<p>特殊符号前加 <code>\</code> 取消格式，原样输出：`# * - ``</p>
<hr/>
<h3 id="heading-7">极简使用总结</h3>
<p>日常记笔记只需掌握：<strong>标题、列表、表格、代码块、折叠块、引用</strong>，足够应对99%场景。</p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(3,'使用FFmpeg合并视频','ffmpeg-join-video',1781697600,1781697600,'<p>使用 <strong>FFmpeg</strong> 进行无损视频合并是它的高频高效操作之一。无损合并的核心原理是<strong>直接复制视频和音频流（Stream Copy）</strong>，而不进行重新编码（Re-encoding）。这样不仅速度极快（几秒钟就能搞定），而且能保证画质和音质绝对没有损失。</p>
<p>以下是为你整理的 FFmpeg 无损视频合并笔记，你可以直接复制到你的 Markdown 编辑器中。</p>
<!-- more -->
<hr/>
<h1 id="-ffmpeg-">📝 FFmpeg 无损视频合并指南</h1>
<p>在使用 FFmpeg 无损合并视频前，必须确保一个<strong>核心前提</strong>：</p>
<blockquote>
<p>⚠️ <strong>所有待合并的视频片段，其分辨率、帧率（FPS）、视频编码格式（如 H.264/HEVC）以及音频编码格式（如 AAC/MP3）必须完全一致。</strong> 如果格式不一致，无损合并后可能会出现音画不同步、视频卡顿或无法播放的情况。</p>
</blockquote>
<hr/>
<h2 id="--concat--mp4ts">🛠️ 方法一：使用 Concat 协议（最快捷，推荐 MP4/TS）</h2>
<p>如果你的视频是 <code>.mp4</code> 或 <code>.ts</code> 格式，且文件名没有特殊字符，最直接的方法是通过命令行传入一个视频列表。</p>
<h3 id="1-">1. 创建视频列表文件</h3>
<p>在视频所在文件夹下，创建一个名为 <code>filelist.txt</code> 的文本文件，内容格式如下（每行一个视频，注意使用相对路径）：</p>
<pre><code class="language-text">file ''input1.mp4''
file ''input2.mp4''
file ''input3.mp4''

</code></pre>
<h3 id="2-">2. 执行合并命令</h3>
<p>打开终端或命令行，定位到该文件夹，运行以下命令：</p>
<pre><code class="language-bash">ffmpeg -f concat -safe 0 -i filelist.txt -c copy output.mp4
</code></pre>
<h3 id="-">🔍 参数详解：</h3>
<ul>
<li><code>-f concat</code>：指定使用 <code>concat</code>（拼接）分离器。</li>
<li><code>-safe 0</code>：允许使用相对路径和一些特殊字符（如果不加，文件名复杂时可能会报错）。</li>
<li><code>-i filelist.txt</code>：指定输入的内容为刚刚创建的文本文件。</li>
<li><code>-c copy</code>：<strong>最关键的参数</strong>。表示视频流和音频流都直接“复制”，不进行重新编码，从而实现<strong>无损且极速</strong>合并。</li>
<li><code>output.mp4</code>：输出的合并文件名。</li>
</ul>
<hr/>
<h2 id="--txt">⚡ 方法二：一行命令搞定（免去手动创建 txt）</h2>
<p>如果你不想手动去新建一个 <code>filelist.txt</code> 文本，可以利用系统命令动态生成列表并传递给 FFmpeg。</p>
<h3 id="-macos--linux-terminal">🍏 macOS / Linux (Terminal)</h3>
<pre><code class="language-bash">printf "file ''%s''\n" input1.mp4 input2.mp4 &gt; list.txt &amp;&amp; ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4 &amp;&amp; rm list.txt
</code></pre>
<h3 id="-windows-powershell">🪟 Windows (PowerShell)</h3>
<pre><code class="language-bash">Get-ChildItem *.mp4 | ForEach-Object { "file ''$($_.Name)''" } | Out-File list.txt -Encoding utf8; ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4; Remove-Item list.txt
</code></pre>
<p><em>(注：Windows 的这条命令会自动把你当前目录下的所有 MP4 文件按名称排序并合并。)</em></p>
<hr/>
<h2 id="--concat-">🧩 方法三：使用 Concat 过滤器（应对多格式/分辨率不一致）</h2>
<blockquote>
<p>💡 <strong>补充场景</strong>：如果你的视频<strong>分辨率或编码不同</strong>，但你强行想要合并它们，<code>-c copy</code> 将无法工作，你必须对它们进行<strong>有损的重新编码</strong>。</p>
</blockquote>
<p>运行以下命令，FFmpeg 会自动将不同规格的视频解码、统一缩放并重新编码合并：</p>
<pre><code class="language-bash">ffmpeg -i input1.mp4 -i input2.mp4 -filter_complex "[0:v][0:a][1:v][1:a] concat=n=2:v=1:a=1 [v][a]" -map "[v]" -map "[a]" output.mp4
</code></pre>
<h3 id="--1">🔍 参数详解：</h3>
<ul>
<li><code>-filter_complex</code>：启用复杂滤镜图。</li>
<li><code>[0:v][0:a][1:v][1:a]</code>：分别代表第 1 个视频的视频流/音频流，和第 2 个视频的视频流/音频流。</li>
<li><code>concat=n=2:v=1:a=1</code>：告诉滤镜有 <code>n=2</code> 个片段，输出 <code>v=1</code> 个视频流和 <code>a=1</code> 个音频流。</li>
<li><code>[v][a]</code>：将合并后的音视频流命名为 <code>[v]</code> 和 <code>[a]</code>。</li>
<li><code>-map "[v]" -map "[a]"</code>：指定将滤镜输出的流写入最终的 <code>output.mp4</code>。</li>
<li><em>(注意：此命令去掉了 <code>-c copy</code>，因此属于有损转换，速度取决于你的 CPU/GPU 性能。)</em></li>
</ul>
<hr/>
<h2 id="--faq">❓ 常见问题与排查 (FAQ)</h2>
<h3 id="1--1">1. 合并后只有第一个片段有声音，后面没声音？</h3>
<ul>
<li><strong>原因</strong>：这通常是因为两个视频的音频采样率（例如一个 44100Hz，一个 48000Hz）或声道数不一致。</li>
<li><strong>解决办法</strong>：建议使用方法三进行重编码合并；或者先单独把音频不一致的片段转换一致，再用方法一无损合并。</li>
</ul>
<h3 id="2--1">2. 视频合并处卡顿、掉帧或音画不同步？</h3>
<ul>
<li><strong>原因</strong>：视频的时间戳（PTS/DTS）在拼接处没有正确衔接，或者两段视频的帧率（FPS）有微小差异（如 29.97fps 和 30fps）。</li>
<li><strong>解决办法</strong>：可以在方法一的命令中加入 <code>-fflags +genpts</code> 参数来尝试重新生成时间戳：</li>
</ul>
<pre><code class="language-bash">ffmpeg -f concat -safe 0 -fflags +genpts -i filelist.txt -c copy output.mp4
</code></pre>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(4,'命令行创建Django项目','install-django',1781697600,1781697600,'<p>这是一份为你整理的 <strong>Django 项目创建命令行教程</strong>。文档已严格按照 Markdown 格式编写，结构清晰，你可以直接复制并保存为 <code>.md</code> 文件作为你的学习笔记。</p>
<!-- more -->
<hr/>
<h1 id="django-">Django 项目创建与基础配置笔记</h1>
<p>本笔记记录了如何完全通过命令行（CLI）从零开始创建一个 Django 项目，并运行开发服务器。</p>
<hr/>
<h2 id="-">## 准备工作</h2>
<p>在创建 Django 项目之前，建议为项目创建一个独立的<strong>虚拟环境</strong>，以防不同项目之间的依赖冲突。</p>
<h3 id="1-">1. 创建并激活虚拟环境</h3>
<p>打开终端（Terminal）或命令提示符（CMD），执行以下命令：</p>
<pre><code class="language-bash"># 1. 新建并进入项目总目录
mkdir my_django_project
cd my_django_project

# 2. 创建名为 venv 的虚拟环境
python -m venv venv

# 3. 激活虚拟环境
# Windows (Command Prompt):
venv\Scripts\activate
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

</code></pre>
<blockquote>
<p><strong>提示</strong>：激活成功后，命令行提示符前方会出现 <code>(venv)</code> 字样。</p>
</blockquote>
<h3 id="2--django">2. 安装 Django</h3>
<p>在激活的虚拟环境中，使用 <code>pip</code> 安装最新版的 Django：</p>
<pre><code class="language-bash">pip install django

</code></pre>
<hr/>
<h2 id="--django-">## 核心步骤：创建 Django 项目</h2>
<p>Django 提供了内置的命令行工具 <code>django-admin</code> 来自动生成项目结构。</p>
<h3 id="1--1">1. 初始化项目</h3>
<p>运行以下命令来创建一个名为 <code>mysite</code> 的 Django 项目：</p>
<pre><code class="language-bash"># 注意后面的“.”（点号），它代表在当前目录下直接生成项目文件，避免多嵌套一层同名目录
django-admin startproject mysite .

</code></pre>
<h3 id="2-">2. 项目目录结构解析</h3>
<p>执行完上述命令后，你的目录结构应该如下所示：</p>
<pre><code class="language-text">my_django_project/
│
├── manage.py          # 项目的管理工具（运行服务器、数据迁移等都要用到它）
├── venv/              # 虚拟环境文件夹（无需修改）
└── mysite/            # 项目的核心配置包
    ├── __init__.py
    ├── settings.py    # 全局配置文件（数据库、时区、App注册等）
    ├── urls.py        # 路由配置文件（URL 映射）
    ├── asgi.py        # 异步服务网关接口配置
    └── wsgi.py        # 同步服务网关接口配置

</code></pre>
<hr/>
<h2 id="--django--app">## 创建 Django 应用 (App)</h2>
<p>在 Django 中，一个<strong>项目 (Project)</strong> 可以包含多个<strong>应用 (App)</strong>。应用是实现具体功能的独立模块（如：博客模块、用户管理模块）。</p>
<h3 id="1--app-">1. 生成 App 目录</h3>
<p>创建一个名为 <code>blog</code> 的应用：</p>
<pre><code class="language-bash">python manage.py startapp blog

</code></pre>
<h3 id="2--app">2. 在配置中注册 App</h3>
<p>创建 App 后，必须让 Django 项目知道它的存在。打开 <code>mysite/settings.py</code>，找到 <code>INSTALLED_APPS</code> 列表，将你的 App 添加进去：</p>
<pre><code class="language-python"># mysite/settings.py

INSTALLED_APPS = [
    ''django.contrib.admin'',
    ''django.contrib.auth'',
    ''django.contrib.contenttypes'',
    ''django.contrib.sessions'',
    ''django.contrib.messages'',
    ''django.contrib.staticfiles'',
    
    # 在这里添加你的 App
    ''blog'', 
]

</code></pre>
<hr/>
<h2 id="--1">## 数据库迁移与启动服务</h2>
<h3 id="1--2">1. 执行初始数据迁移</h3>
<p>Django 自带了一些默认应用（如用户认证、后台管理），它们需要数据库表支持。运行以下命令生成默认的 SQLite 数据库并创建表：</p>
<pre><code class="language-bash">python manage.py migrate

</code></pre>
<h3 id="2--1">2. 启动本地开发服务器</h3>
<p>一切就绪后，启动 Django 内置的测试服务器：</p>
<pre><code class="language-bash">python manage.py runserver

</code></pre>
<h3 id="3-">3. 验证成果</h3>
<p>看到终端输出 <code>Starting development server at http://127.0.0.1:8000/</code> 后，打开浏览器访问该网址。如果你看到了一只成功起飞的火箭页面，说明你的 Django 项目已经搭建成功！</p>
<hr/>
<h2 id="--2">## 常用命令行备忘录</h2>
<p>在日常开发中，以下命令会频繁使用，建议熟记：</p>
<table>
<thead>
<tr>
<th>命令</th>
<th>作用</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>python manage.py runserver</code></td>
<td>启动开发服务器</td>
</tr>
<tr>
<td><code>python manage.py startapp &lt;app_name&gt;</code></td>
<td>创建一个新的应用</td>
</tr>
<tr>
<td><code>python manage.py makemigrations</code></td>
<td>基于 <code>models.py</code> 的修改生成迁移文件</td>
</tr>
<tr>
<td><code>python manage.py migrate</code></td>
<td>将迁移应用到数据库（实际建表/改表）</td>
</tr>
<tr>
<td><code>python manage.py createsuperuser</code></td>
<td>创建后台管理系统的超级管理员账号</td>
</tr>
<tr>
<td><code>python manage.py shell</code></td>
<td>进入带有 Django 环境的 Python 交互式命令行</td>
</tr>
</tbody>
</table>
<hr/>
<p><em>笔记末尾：按 <code>Ctrl + C</code> 可以停止正在运行的开发服务器。退出虚拟环境请输入 <code>deactivate</code>。</em></p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(5,'EdgeTunnel','edge-tunnel',1780315200,1780315200,'<p>edgetunnel 是一个开源的边缘计算代理工具，基于 Cloudflare Workers/Pages 平台构建。它的主要功能是通过边缘网络处理流量，为用户提供科学上网能力。</p>
<!-- more -->
<p>本教程将指导你如何在 Fork 了 <code>cmliu/edgetunnel</code> 仓库后，通过 <strong>Cloudflare Pages + GitHub 联动</strong> 的方式部署属于自己的多功能边缘计算隧道面板。</p>
<hr/>
<h2 id="-">📌 准备工作</h2>
<p>在开始部署之前，请确保你已具备以下条件：</p>
<ol>
<li><strong>GitHub 账号</strong>：用于存放 Fork 的项目代码。</li>
<li><strong>Cloudflare (CF) 账号</strong>：用于托管和运行 Pages 边缘服务。</li>
<li><strong>一个自定义域名</strong>：由于 Cloudflare 自带的 <code>pages.dev</code> 域名在国内部分地区可能存在被墙或无法解析的情况，<strong>强烈建议准备一个转入 Cloudflare 解析的自定义次级域名</strong>（例如 <code>vpn.yourdomain.com</code>）。</li>
</ol>
<hr/>
<h2 id="-fork-">🛠 步骤一：Fork 项目仓库</h2>
<ol>
<li>访问 edgetunnel 的官方 GitHub 仓库：<a href="https://github.com/cmliu/edgetunnel">https://github.com/cmliu/edgetunnel</a>。</li>
<li>点击页面右上角的 <strong>Fork</strong> 按钮。</li>
<li>在弹出的页面中，保持默认设置，点击 <strong>Create fork</strong>。</li>
<li>（可选）顺手点一个 <strong>Star</strong> 🌟 也是对作者的鼓励。</li>
</ol>
<hr/>
<h2 id="--cloudflare--pages-">🛠 步骤二：在 Cloudflare 中创建 Pages 项目</h2>
<ol>
<li>登录你的 <a href="https://dash.cloudflare.com/">Cloudflare 控制台</a>。</li>
<li>在左侧导航栏中，依次点击 <strong>「Workers 和 Pages」</strong> -&gt; <strong>「概述」</strong>。</li>
<li>点击右侧的 <strong>「创建」</strong> 按钮，然后选择 <strong>「Pages」</strong> 标签页。</li>
<li>点击 <strong>「连接到 Git」</strong> 按钮。</li>
<li>选择 <strong>GitHub</strong>（如果第一次使用，需要按照提示授权 Cloudflare 访问你的 GitHub 账号）。</li>
<li>在仓库列表中找到你刚刚 Fork 的 <code>edgetunnel</code> 仓库，选中它并点击 <strong>「开始设置」</strong>。</li>
</ol>
<hr/>
<h2 id="--1">🛠 步骤三：配置环境变量与初次部署</h2>
<p>在 <strong>「设置构建和部署」</strong> 页面，我们需要进行以下配置：</p>
<ol>
<li><strong>项目名称</strong>：保持默认或自定义（该名称会决定你默认的 <code>.pages.dev</code> 网址）。</li>
<li><strong>框架预设</strong>：保持默认（无/None）。</li>
<li><strong>配置环境变量（核心步骤）</strong>：
<ul>
<li>展开页面下方的 <strong>「环境变量（高级）」</strong>。</li>
<li>点击 <strong>「添加变量」</strong>。</li>
<li><strong>变量名称</strong> 填写：<code>ADMIN</code></li>
<li><strong>值</strong> 填写：<code>你的管理员密码</code>（此密码用于后续登录后台面板，请务必记牢）。</li>
</ul>
</li>
<li>完成后，点击页面的 <strong>「保存并部署」</strong>。</li>
<li>Cloudflare 将开始初次构建。等待 1-2 分钟，构建完成后点击 <strong>「继续处理站点」</strong>。</li>
</ol>
<blockquote>
<p>⚠️ <strong>注意</strong>：此时虽然提示部署成功，但由于我们还没有绑定数据库（KV 命名空间），此时访问后台会报错。请继续看下一步。</p>
</blockquote>
<hr/>
<h2 id="--kv-">🛠 步骤四：绑定 KV 命名空间</h2>
<p>edgetunnel 需要使用 Cloudflare 的 KV（键值对）存储来保存节点配置。</p>
<h3 id="1--kv-">1. 创建 KV 命名空间</h3>
<ol>
<li>返回 Cloudflare 控制台主页，点击左侧导航栏的 <strong>「Workers 和 Pages」</strong> -&gt; <strong>「KV」</strong>。</li>
<li>点击右上角的 <strong>「创建命名空间」</strong>。</li>
<li>命名空间名称可以随意填写（例如：<code>edgetunnel_kv</code>），然后点击 <strong>「添加」</strong>。</li>
</ol>
<h3 id="2--pages--kv-">2. 将 Pages 项目与 KV 绑定</h3>
<ol>
<li>回到你的 <strong>Pages 项目管理页面</strong>。</li>
<li>点击顶部的 <strong>「设置」</strong> 选项卡。</li>
<li>在左侧菜单中选择 <strong>「绑定」</strong>。</li>
<li>在页面右侧找到 <strong>「KV 命名空间绑定」</strong> 区域，点击 <strong>「添加绑定」</strong>。</li>
<li><strong>变量名称</strong> 必须严格填写：<code>KV</code></li>
<li><strong>KV 命名空间</strong> 选择你刚刚创建的命名空间（例如 <code>edgetunnel_kv</code>）。</li>
<li>点击 <strong>「保存」</strong>。</li>
</ol>
<h3 id="3-">3. 重新部署以使绑定生效</h3>
<ol>
<li>切换到 Pages 项目的 <strong>「部署」</strong> 选项卡。</li>
<li>在最新的部署记录（通常是第一条）右侧，点击 <strong>「三个点 (…)」</strong>。</li>
<li>选择 <strong>「重试部署」</strong>。等待部署重新完成。</li>
</ol>
<hr/>
<h2 id="--2">🛠 步骤五：绑定自定义域名（关键）</h2>
<p>Cloudflare Pages 默认分配的 <code>*.pages.dev</code> 域名由于众所周知的原因，国内连接极不稳定。必须绑定自定义域名才能稳定使用。</p>
<ol>
<li>在 Pages 项目管理页面，点击 <strong>「自定义域」</strong> 选项卡。</li>
<li>点击 <strong>「设置自定义域」</strong>。</li>
<li>输入你的次级域名，例如：<code>lizi.yourdomain.com</code>（<strong>切记：请勿直接使用根域名</strong>）。</li>
<li>按照 Cloudflare 提示激活该域名：
<ul>
<li>如果你的域名已经由 Cloudflare 解析，系统会自动帮你添加一条 CNAME 记录，指向 <code>edgetunnel.pages.dev</code>，你只需点击 <strong>「激活域」</strong> 即可。</li>
<li>如果域名在其他第三方解析商，你需要手动去解析商后台添加一条 CNAME 记录。</li>
</ul>
</li>
<li>等待 SSL 证书生效（通常需要几分钟）。</li>
</ol>
<hr/>
<h2 id="--3">🎉 步骤六：访问与使用面板</h2>
<ol>
<li>证书生效后，在浏览器中访问：<code>https://你的自定义域名/admin</code>（例如：<code>https://lizi.yourdomain.com/admin</code>）。</li>
<li>输入你在环境变量中设置的 <code>ADMIN</code> 密码，点击登录。</li>
<li>登录成功后，你将进入功能强大的 edgetunnel 2.1 后台管理面板。在面板中，你可以：
<ul>
<li>自动生成 VLESS / Trojan / Shadowsocks 节点。</li>
<li>获取适配 Clash、Sing-box、Surge、Shadowrocket 等客户端的订阅链接。</li>
<li>配合优选 IP API 或配置 <code>PROXYIP</code> 变量进一步优化网络速度。</li>
</ul>
</li>
</ol>
<hr/>
<h2 id="--4">💡 进阶技巧：如何同步更新代码？</h2>
<p>由于你是通过 GitHub Fork 部署的，当原作者 <code>cmliu</code> 更新代码时，你只需要：</p>
<ol>
<li>访问你自己的 GitHub <code>edgetunnel</code> 仓库。</li>
<li>如果原作者有更新，GitHub 会提示 <code>This branch is behind cmliu/edgetunnel</code>。</li>
<li>点击 <strong>Sync fork</strong> -&gt; <strong>Update branch</strong>。</li>
<li>你的 GitHub 仓库更新后，<strong>Cloudflare Pages 会自动触发构建并完成更新部署</strong>，全程无需手动干预。</li>
</ol>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(6,'驳X上男拳','refute-x-simp',1777550400,1777550400,'<p>假如一个山寨的女式挎包，老板就要以二十万的价格出售。</p>
<ul>
<li>抖音：管我屁事，我又不买，去买摩托车、电脑不香吗？</li>
<li>知乎：理性分析包包材质质感，分析得出只值二十元。</li>
<li>推特：上来就辱骂，材质烂、老板痴心妄想，但是就在摊前徘徊，急得跳脚。</li>
</ul>
<!-- more -->
<p>X上这些打男拳的就像清末的农民起义，乱世的到来破坏了他们老婆孩子热炕头在清政府下苟活的日子，他们不知道民主共和，揭竿而起只是为了回到之前的状态。所以他们的推文很少有男性解放、爱自己、投资自身、不转移支付等观点。女拳胁B和子宫要价，他们讨价还价、求而不得；又没有自己的生活，所以他们的关注点都在国妞身上。他们嘲笑谩骂、道德绑架、动不动就栓等暗里明里的行为表现了对国妞的极度渴望。男女对立最核心的问题：到底是谁离不开谁？这么看，他们真是离不开国妞。这点我倒是很佩服女拳，达不到她们的要求人家真不结婚。我都怀疑如果国妞降低结婚要求，他们反身舔得比谁都快，他们会忘掉前一阶段普男被“镇压”的痛苦，毕竟他们的目的就是结婚生子。现阶段他们舔而不得、心生埋怨，所以才造就他们以这样的方式打拳。我一直认为爱的反义词从来不是恨，是平淡是无视，所以这些人表现出恨女又渴女的拧巴现状。</p>
<p>舔狗从表象上分为两种。第一种是显性舔狗。他们会无脑的相信女人，认为女人都是善良美好的，相信单方面持之以恒的付出总会感动对方。第二种就是隐形舔狗。他们困死在“男性就应该成家繁衍”这种思维之中。他们无法达成这种想法，就对女性散发着一种求而不得的埋怨之气。人家女拳在研究吃喝玩乐、精致生活、要特权、脱产考公、PUA龟男舔狗、高嫁、骗彩礼、死老公、分财产。人家早就摆脱传统道德枷锁，所作所为就是为了钱和权。你在看看这群隐形舔狗在研究什么。首先最下头的是质疑对方要价高；自由市场，你出不起的价格，有的是龟男舔狗上杆子；嘲笑对方长得丑、想得美，大龄没有生育能力被剩下。这些难道不是她们的自由吗？他们就是想买又买不起，拿着传统的“三从四德”去绑架攻击对方。自己喷的起劲，关键对方根本没有“道德”。他们主张男性要有生育权，关心生育率这种宏观事件；更有甚者，高举董的锁链思想，意淫口嗨一副离不开女人的嘴脸。说来说去就是为了女人和生育。两者相比，高下立判，你有求于对方，你拿什么和女拳打？</p>
<p>我一直秉持着反女拳就要先喷舔狗观念，毕竟女拳都是被这帮玩意抬高供养出来的。舔狗又分三个层级。</p>
<ol>
<li>自己舔，感动自己，比如胖猫。</li>
<li>自己舔，还看不惯别人不舔，比如抨击男性不帮忙女性是不绅士。</li>
<li>舔而不得心生埋怨，又不自知；高举反女拳的旗帜去打拳，其实是扯男性解放(摒弃儒教大男子主义)的后腿。</li>
</ol>
<p>纵观日韩女拳的失败，完全是因为她们只要特权不付出义务，只会嘴上叫嚣。日男韩男是通过平等对待、不支付转移、投资自身、消费抉择。通过实际行动告诉日女韩女、日韩政府，离开日女韩女完全没什么问题。日韩生育率雪崩这是结果，所有我特别反感X上的男拳对中国生育率的担忧。</p>
<p>最后，别指望上层对普通男性的困境的理解，普通男性和有钱/权的男性是两个世界的人。有钱/权的男性不是女拳讨伐的对象、反而是她们竞争追逐的对象。所以人家凭什么和你感同身受，这也是上层很容易制定利女政策的原因。利女一方面是他们认为国男为了性和生育离不开国妞，偏偏国男又不争气；另一方面为了拉动消费，男性消费普片理性，通过结婚生育来达到支付转移。</p>
<p>口嗨意淫是没什么用的，普通男性只能从小实事做起。</p>
<ol>
<li>对舔狗的围剿、痛打落水狗。
<ul>
<li>在此声明，胖猫是反面案例，没有什么值得怜悯的。</li>
<li>嘲笑被骗高额彩礼的龟男，高彩礼是国男供出来的。</li>
</ul>
</li>
<li>对女性平等对待。
<ul>
<li>帮不帮陌生女性看自己能力和心情了，不要有绅士思维的顾虑。</li>
<li>和女性发生争执，有没有把他当作男性进行“决斗”。</li>
<li>占据主动权，对国女能谈就谈、不能谈拉倒，能结婚就结婚、不愿结婚拉倒，愿意生孩子就生、不愿意生拉倒。</li>
</ul>
</li>
<li>投资自己，把钱花在自己身上。
<ul>
<li>把钱花在支持男性解放观点的公司；同时警惕消费陷阱，不要像女拳那样容易被消费主义洗脑。</li>
<li>资本这玩意就先狗一样，谁直接给他骨头(钱)，他就对谁摇尾巴。之前龟男舔狗支付转移，所有他们舔女性。</li>
<li>统治层面，房车生育之前都是女性要求/把持才能实现，所有上层也利女。谁让国男就是想结婚生子。</li>
</ul>
</li>
<li>相信法律但是不要迷信法律。法律给不了自己公道，自己就去寻求公道。</li>
</ol>
<p>就写这些。如果你不赞同我的观点，可以反驳我。但是如果你直接骂我，那就是对号入座，戳痛你舔狗的本质了。</p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(7,'AnyDesk','anydesk',1763985600,1763985600,'<p>AnyDesk是一款由德国公司AnyDesk Software GmbH推出的远程桌面软件，用户可以通过该软件远程控制计算机，同时还能与被控制的计算机之间进行文件传输。</p>
<!-- more -->
<p>2014年，AnyDesk Software GmbH在德国斯图加特成立，目前在美国和中国都设有分公司。2018年5月，AnyDesk在A轮融资中获得由EQT Ventures领投的650万欧元资金投资。</p>
<p><strong>下载地址：</strong><br/>
<a href="https://bucket.lanzoub.com/izTBh3c16jvi" target="_blank">AnyDesk_V7.0.0.exe</a><br/>
<a href="https://bucket.lanzoub.com/i0MQ43c16jsf" target="_blank">AnyDesk_V7.0.0.dmg</a></p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(8,'FastStone Capture','faststone-capture',1745496000,1745496000,'<p>FastStone Capture 一个极简主义的应用程序<br/>
支持屏幕录制、滚动截图、高清长图、图片编辑、图片转PDF格式、屏幕取色</p>
<!-- more -->
<p>功能简介：</p>
<p>高清截屏，给您最清晰的表达<br/>
可抓取某窗口或对象图片,全屏或以矩形模式抓图，甚至可以按照手绘的任意形状抓图。</p>
<p>滚动截图，细节内容一览无余<br/>
选定某个窗口或对象区域,轻点鼠标即可进行滚动截图,获取高清长图。</p>
<p>屏幕录制，步骤操作细致流畅<br/>
屏幕录像机功能可以将窗口/对象、矩形区域或全屏区域的屏幕录制为高清晰视频。</p>
<p>图片编辑，样式丰富应有尽有<br/>
所有主流图片格式,以其独有的光滑和毛刺处理技术让图片更加清晰,提供缩放,旋转,减切,颜色调整功能。</p>
<p><strong>下载地址：</strong><br/>
<a href="https://bucket.lanzoub.com/iktSw2ucfq4f" target="_blank">FastStoneCapture_V9.7.zip</a></p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(9,'批量修改文件名','win-rename',1738929600,1738929600,'<p>批量修改文件名4.4发布</p>
<!-- more -->
<p>主要更新:</p>
<ul>
<li>增加一个AI处理功能。一些网友可能有一些复杂特殊的需求，自己不知道怎么操作，来咨询我，一步两步不能解决，就很麻烦，这次用AI能很好的解决问题，只要你问得够详细。</li>
<li>增加一个清空按钮</li>
<li>增加在文件名前添加所属文件夹名称的功能。</li>
</ul>
<p><strong>下载地址：</strong><br/>
<a href="https://bucket.lanzoub.com/iOOAz2n1r7wd" target="_blank">WinRename_V4.4.exe</a></p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(10,'BandiZip','bandizip',1737547200,1737547200,'<p>Bandizip 是一款压缩软件，它支持Zip、7Z 和 RAR 以及其它压缩格式。它拥有非常快速的压缩和解压缩的算法，适用于多核心压缩、快速拖放、高速压缩等功能。</p>
<!-- more -->
<p>支持压缩: ZIP, 7Z, ZIPX, EXE, TAR, TGZ, LZH, ISO, GZ, XZ</p>
<p>支持解压缩: 7Z, ACE, AES, ALZ, ARJ, BH, BIN, BZ, BZ2, CAB, MSI, EGG, GZ, IMG, ISO, ISZ, LHA, LZ, LZH, LZMA, PMA, RAR, TAR, TBZ, TBZ2, TGZ, TLZ, TXZ, UDF, WIM, XPI, XZ, Z, ZIP, ZIPX, ZPAQ, ZSTD, BR</p>
<p><strong>下载地址：</strong><br/>
<a href="https://bucket.lanzoub.com/iChtg2lmnb4j" target="_blank">BandiZip_V6.29.exe</a><br/>
<a href="https://bucket.lanzoub.com/iHO8m2lmnadc" target="_blank">BandiZip_V7.30.dmg</a></p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(11,'Clipdiary','clipdiary',1737115200,1737115200,'<p>Clipdiary是一款轻量级的专业剪贴板管理工具，拥有强大的历史记录查看功能，并且还拥有便利的中文界面，能够自动保存你复制粘贴的文本内容，是你可以提供历史记录查看需要的内容，很好解决因为断电等问题导致剪贴板内容丢失或是剪贴板为纯文本带来的不便。软件支持XP、Windows 7/8以及最新的Windows10系统，运行后用户可记录每一条复制到Windows剪贴板中的数据，软件使用非常方便，它运行于系统托盘当中，你每次所做的拷贝动作，它都会为你自动保存，并且提供了一个最近拷贝项目的列表，你可以随时对拷贝历史进行调用。此外，软件支持快捷键操作，通过CTRL+C可进行信息复制，默认使用CTRL+D可打开该软件，双击列表中的项目可实现粘贴。能够提高您的工作效率，节省大量的时间。</p>
<!-- more -->
<p>Clipdiary 功能很丰富，官网列出了如下特性：</p>
<ul>
<li>监视剪贴板并自动保存其内容到剪贴板历史</li>
<li>可处理文本，链接，图像，文件及所有其它剪贴板格式</li>
<li>支持给剪辑加星标和标签。标记为重要剪辑并使用标签将它们分组到文件夹内</li>
<li>片段 – 用于快速粘贴的常用文本模板</li>
<li>系统重启时保持剪贴板历史</li>
<li>在需要时您可找回存储到剪贴板历史内的数据，即使是数年后也可</li>
<li>支持数据库加密（AES-256）</li>
</ul>
<p><strong>下载地址：</strong><br/>
<a href="https://bucket.lanzoub.com/iFdVv2l5h6if" target="_blank">Clipdiary_V5.7.exe</a></p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(12,'手心输入法','palm-input',1737115200,1737115200,'<p>手心输入法是一款智能、高效、无广告骚扰、只专注于输入本质的纯粹输入法。手心输入法拥有强大的智能输入引擎、丰富的本地词库、在线词库及精美皮肤在线下载，能够在Windows、Android、iOS与Mac系统上使用。</p>
<!-- more -->
<p>手心拼音输入法是一款轻巧的拼音输入法。手心拼音输入法关注核心输入体验，拥有丰富的词库以及精美的皮肤，可以简洁高效地实现拼音输入。手心输入法最大的特点就在于简洁，没有任何广告和与输入法无关的功能，只在乎用户的输入体验。更拥有海量词库能为用户实现高效的拼音输入。</p>
<p><strong>下载地址：</strong><br/>
<a href="https://bucket.lanzoub.com/iF45K2i7y46h" target="_blank">PalmInput_V2.7.exe</a><br/>
<a href="https://bucket.lanzoub.com/iSiX42l5gumh" target="_blank">PalmInput_V1.1.27.dmg</a></p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(13,'Paste','paste-app',1737115200,1737115200,'<p>Paste具有简洁明了的界面和易于使用的操作方式。用户只需要在软件界面上点击想要粘贴的内容，就可以直接将其粘贴到所需的文档或应用中。此外，Paste还支持多种粘贴方式，包括纯文本粘贴、富文本粘贴和图片粘贴等，可以根据用户的需求进行选择。</p>
<!-- more -->
<p>除了剪贴板历史记录功能外，Paste还提供了其他实用的工具和功能。例如，它可以自动识别并提取网页中的表格信息，方便用户快速整理和整理数据。此外，Paste还支持跨平台使用，可以在不同设备之间同步剪贴板历史记录，方便用户随时随地使用。</p>
<p>总之，Paste是一款实用的剪贴板历史工具，它可以帮助用户高效地管理剪贴板历史记录，并快速地将内容粘贴到所需的文档或应用中。无论你是学生还是工作者，Paste都可以提高你的工作效率和创造力。​​​​</p>
<p><strong>下载地址：</strong><br/>
<a href="https://bucket.lanzoub.com/io6fA2l5lh4b" target="_blank">Paste_V2.5.0.zip</a><br/>
<a href="https://bucket.lanzoub.com/it7Z32l5lhfc" target="_blank">Paste_V4.4.2.dmg</a></p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(14,'TIM','tim',1737115200,1737115200,'<p>腾讯的TIM是一款专注于办公的聊天软件，其特色主要体现在简洁的操作界面、高效的办公功能以及与QQ的无缝同步‌。</p>
<!-- more -->
<p>‌简洁的操作界面‌：</p>
<ul>
<li>TIM去除了QQ中的大部分娱乐功能，如QQ空间等，只保留了与工作直接相关的服务，如腾讯文档、微云网盘等，为用户打造一个更为简洁、高效的办公环境‌。</li>
<li>TIM的操作界面简洁明了，易于上手，让习惯使用QQ的用户也能快速适应‌。</li>
</ul>
<p>‌高效的办公功能‌：</p>
<ul>
<li>TIM支持多人在线编辑Word、Excel等文档，以及多人通话和视频会议，极大地提高了办公效率‌。</li>
<li>TIM还提供了免费的音视频通话功能，支持会议预定，方便用户进行远程沟通和协作‌。</li>
</ul>
<p>‌与QQ的无缝同步‌：</p>
<ul>
<li>TIM使用了QQ的账号体系，用户可以使用QQ账号登录TIM，登录后联系人、消息、群、多人群聊与关系链相关的数据均是双向同步的‌。</li>
<li>TIM还支持聊天记录的全平台同步，无论是电脑端还是移动端，用户都能随时查看和管理自己的聊天记录。</li>
</ul>
<p>此外，TIM还不断推出新的功能和优化，如深色模式、红包发送和文件传输功能的改进等，以满足用户的不同需求‌。同时，TIM也注重用户数据的安全保护，采用了先进的技术框架和安全策略，确保用户账号和数据的安全‌。</p>
<p>综上所述，腾讯的TIM以其简洁的操作界面、高效的办公功能以及与QQ的无缝同步等特色，成为了许多用户办公沟通的首选工具。</p>
<p><strong>下载地址：</strong><br/>
<a href="https://bucket.lanzoub.com/ixo9W2l5hnze" target="_blank">TIM_V3.5.0.exe</a></p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(15,'大长今','dae-jang-geum',1737028800,1737028800,'<p>长今（李英爱 饰）出生在一个贱民家庭，他的父亲徐天寿原来当年曾是内禁卫军官，奉命赐予废太后允氏毒药，随后允氏的儿子燕山君登基继位，天寿为了保全自身，辞官而去。天寿在途中救了长今母亲，两人结为连理，隐姓埋名。岂料皇上燕山君如今欲为母报仇，下令追捕所有当年参与杀死允太后的人，长今母亲逃难路上不幸丧命，临终前嘱咐长今进宫。失去了父母的小长今幸得宫中熟手姜德久一家收留，并在他的安排下进入了宫中御厨房做工，开始了她漫长的宫中历程。 韩尚宫（梁美京 饰）非常照顾聪明好学的小长今，然而崔尚宫却因为与韩尚宫的不和而对长今处处刁难，每次在崔尚宫的设局陷害下，长今都以自己的蕙质兰心和坚持不懈一一化解，然而她母亲的身世秘密却逐渐浮出水面，还有更大的困难挡在长今的面前。</p>
<!-- more -->
<pre><code>magnet:?xt=urn:btih:3556f93263ff91fe2544e28ec7f99aa995462492
</code></pre>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(16,'霸王别姬','farewell-my-concubine',1737028800,1737028800,'<p>段小楼（张丰毅 饰）与程蝶衣（张国荣 饰）是一对打小一起长大的师兄弟，两人一个演生，一个饰旦，一向配合天衣无缝，尤其一出《霸王别姬》，更是誉满京城，为此，两人约定合演一辈子《霸王别姬》。但两人对戏剧与人生关系的理解有本质不同，段小楼深知戏非人生，程蝶衣则是人戏不分。段小楼在认为该成家立业之时迎娶了名妓菊仙（巩俐 饰），致使程蝶衣认定菊仙是可耻的第三者，使段小楼做了叛徒，自此，三人围绕一出《霸王别姬》生出的爱恨情仇战开始随着时代风云的变迁不断升级，终酿成悲剧。</p>
<!-- more -->
<pre><code>magnet:?xt=urn:btih:3bf2f6a50d94965804d5c612e7b67866bbb2fb9d
</code></pre>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(17,'天涯侠医','the-last-breakthrough',1737028800,1737028800,'<p>产科医生王甫芬（张家辉 饰）天资聪慧，但又傲慢自负，对于女友死在他怀中，而自己却束手无策他始终心存愧疚。八年前，他与心内科医生齐百恒（林峯 饰）一块远赴非洲执行援外仼务，亲眼目睹了人类在大自然中生存的韧性，援外的八年中，他的人生观发生了巨大改变。回港后，他不再为名利所累，一切以病人为中心，在慈善家的资助下，开设了龙城医疗中心，专心致志为病人服务。百恒初入龙城，他十分惊诧甫芬的工作作风，甫芬为病人治疗不惧踏医学雷区，不按常理出牌，但往往效果出人意料的好，久而久之，近朱者赤，百恒被其人道主义精神所感染，更被甫芬“即医病又医心” 的品德所感动…..</p>
<!-- more -->
<pre><code>magnet:?xt=urn:btih:facfe1111a92cf3c12c06fdab7edb29915bfb12e
</code></pre>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(18,'肖申克的救赎','the-shawshank-redemption',1737028800,1737028800,'<p>1947年，小有成就的青年银行家安迪因涉嫌杀害妻子及她的情人而锒铛入狱。在这座名为肖申克的监狱内，希望似乎虚无缥缈，终身监禁的惩罚无疑注定了安迪接下来灰暗绝望的人生。未过多久，安迪尝试接近囚犯中颇有声望的瑞德，请求对方帮自己搞来小锤子。以此为契机，二人逐渐熟络，安迪也仿佛在鱼龙混杂、罪恶横生、黑白混淆的牢狱中找到属于自己的求生之道。他利用自身的专业知识，帮助监狱管理层逃税、洗黑钱，同时凭借与瑞德的交往在犯人中间也渐渐受到礼遇。表面看来，他已如瑞德那样对那堵高墙从憎恨转变为处之泰然，但是对自由的渴望仍促使他朝着心中的希望和目标前进。而关于其罪行的真相，似乎更使这一切朝前推进了一步。</p>
<!-- more -->
<pre><code>magnet:?xt=urn:btih:4ce7406ff2ec880003e388be7ad2de2c232bb474
</code></pre>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(19,'遗失的世界','the-lost-world',1736942400,1736942400,'<p>一本记录了神秘信息的笔记本暴露在了公众的视线之中，笔记本中记载的是在现实世界中不可能发生的奇幻经历。为了找到真相，乔治教授（彼得·麦考利 Peter McCauley 饰）组建了一支由各行各业精英所组成的强悍探险队伍，深入笔记本中那片不存在于地图之中的遗失的世界，会有怎样惊险刺激的经历等待着他们呢？</p>
<!-- more -->
<p>在茂盛的密林之中，科学家们很快就迷失在了错综复杂的小径之中，一边是团队内的矛盾不断升级，一边是神出鬼没的各类嗜血野兽和个性暴躁的原始部落野人，内忧外患之中，一位名叫维罗妮卡（詹妮佛·欧戴尔 Jennifer O’Dell 饰）的女野人向探险队伸出了援手，在维罗妮卡的帮助之下，他们能够顺利脱险吗？</p>
<pre><code>magnet:?xt=urn:btih:ea98ae0b4bfeebd8491e655f76e188d9d84ca9cf
</code></pre>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(20,'iOS面试知识点2020','ios-interview',1608724800,1608724800,'<iframe height="600px" src="https://winston.ink/post-images/ios-interview.pdf" width="100%"></iframe>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(21,'macOS终端设置代理','macos-terminal-proxy',1599134400,1599134400,'<p>// 设置代理，仅对当前窗口有效<br/>
<code>export all_proxy=socks5://127.0.0.1:1080</code><br/>
// 查看ip地址<br/>
<code>curl cip.cc</code><br/>
// 还原代理<br/>
<code>unset all_proxy</code></p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(22,'iOS知识点大纲','ios-outline',1575460800,1575460800,'<p><img alt="iOS知识点大纲" src="https://winston.ink/post-images/ios-outline.png"/></p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(23,'Git常用命令','git',1574078400,1574078400,'<p>Git（读音为/gɪt/）是一个开源的分布式版本控制系统，可以有效、高速地处理从很小到非常大的项目版本管理。也是Linus Torvalds为了帮助管理Linux内核开发而开发的一个开放源码的版本控制软件。</p>
<!-- more -->
<p>查看Git版本号<br/>
<code>git --version</code></p>
<p>新建SSH<br/>
<code>ssh-keygen -t rsa -C ""braum@sina.com"" -f ~/.ssh/braum</code></p>
<p>初次使用Git前的配置<br/>
<code>git config --global user.name ""John Doe""</code><br/>
<code>git config --global user.email johndoe@example.com</code></p>
<p>添加远程仓库地址<br/>
<code>git remote add origin URL</code></p>
<p>Git的初始化<br/>
<code>git init</code></p>
<p>暂存工作区<br/>
<code>git stash</code></p>
<p>查看暂存的记录<br/>
<code>git stash list</code></p>
<p>暂存 –恢复到–&gt; 工作区<br/>
<code>git stash apply</code><br/>
<code>git stash apply stash@{0}</code><br/>
删除暂存记录<br/>
<code>git stash drop</code></p>
<p>暂存内容恢复到工作区，并删除<br/>
<code>git stash pop</code></p>
<p>添加到暂存区<br/>
<code>git add 文件名</code></p>
<p>提交到仓库<br/>
<code>git commit -m ""描述""</code></p>
<p>已跟踪的文件添加和提交<br/>
<code>git commit -am ""描述""</code></p>
<p>修改上一次的提交描述<br/>
<code>git commit --amend -m ""新的说明""</code></p>
<p>修改上一次提交的时间<br/>
<code>$ date -R</code><br/>
<code>git commit --amend  --date=""想要commit的时间""</code></p>
<p>查看状态<br/>
<code>git status</code></p>
<p>恢复暂存区至以前的状态<br/>
<code>git reset HEAD</code></p>
<p>恢复暂存区的某个文件至以前的状态<br/>
<code>git reset HEAD 文件名</code></p>
<p>恢复工作区的某个文件至以前的状态<br/>
<code>git checkout -- 文件名</code><br/>
<code>git checkout .</code></p>
<p>暂时回到某版本<br/>
<code>git checkout 版本号</code></p>
<p>查看历史提交<br/>
<code>git log</code><br/>
<code>git log --oneline</code><br/>
<code>git log --decorate --oneline --graph --all</code></p>
<p>查看所有的历史版本<br/>
<code>git reflog</code></p>
<p>移动指针到上一个版本，暂存区文件回到上一个版本<br/>
<code>git reset HEAD~</code><br/>
<code>git reset HEAD~10</code><br/>
<code>git reset --mixed HEAD~</code></p>
<p>移动指针到上一个版本<br/>
<code>git reset --soft HEAD~</code></p>
<p>移动指针到上一个版本，暂存区和工作区文件回到上一个版本<br/>
<code>git reset --hard HEAD~</code></p>
<p>回滚到指定版本<br/>
<code>git reset 版本号</code><br/>
<code>git reset --mixed 版本号</code></p>
<p>回滚个别文件(此时不移动指针)<br/>
<code>git reset 版本号 文件名/路径</code><br/>
<code>git reset HEAD 文件名</code></p>
<p>比较工作区和暂存区的不同<br/>
<code>git diff</code></p>
<p>比较两个历史版本的不同<br/>
<code>git diff 版本号 版本号</code></p>
<p>比较工作区和仓库中的不同<br/>
<code>git diff 版本号</code></p>
<p>比较暂存区和仓库中的不同<br/>
<code>git diff --cached 版本号</code></p>
<p>删除文件(删除工作区和暂存区的文件)<br/>
<code>git rm 文件名</code></p>
<p>暴力删除(工作区和暂存区的文件不同时)<br/>
<code>git rm -f 文件名</code></p>
<p>只删除暂存区的文件<br/>
<code>git rm --cached  文件名</code></p>
<p>重命名文件<br/>
<code>git mv 旧文件名 新文件名</code></p>
<p>创建分支<br/>
<code>git branch 分支名</code></p>
<p>创建并切换分支<br/>
<code>git checkout -b 分支名</code></p>
<p>切换分支<br/>
<code>git checkout 分支名</code></p>
<p>合并分支<br/>
<code>git merge 分支名</code></p>
<p>删除分支<br/>
<code>git branch -d 分支名</code></p>
<p>推送到远程仓库<br/>
<code>git push URL master</code></p>
<p>拉取远程仓库<br/>
<code>git pull URL master</code></p>
<p>克隆远程仓库<br/>
<code>git clone URL</code></p>
<p>查看分支<br/>
<code>git branch -a</code></p>
<p>拉取远程分支到本地<br/>
<code>git fetch</code><br/>
<code>git fetch origin 远程分支名:本地分支名</code></p>
<p>创建分支A，并将远程分支B拉至本地<br/>
<code>git checkout -b 分支名A origin/分支名B</code></p>
<p>查看远程仓库地址<br/>
<code>git remote -v</code></p>
<p>删除远程分支<br/>
<code>git push origin :远程分支名 </code></p>
<p>Git修改远程仓库地址 方法有三种：<br/>
1.修改命令<br/>
<code>git remote set-url origin URL</code><br/>
2.先删后加<br/>
<code>git remote rm origin</code><br/>
<code>git remote add origin URL</code><br/>
3.直接修改config文件</p>
<p>查看所有标签<br/>
<code>git tag</code></p>
<p>添加标签<br/>
<code>git tag Qualitrain_release_1.1.1_11-12-18</code></p>
<p>给某次提交添加标签<br/>
<code>git tag v1.1 6224937</code></p>
<p>查看标签信息<br/>
<code>git show Qualitrain_release_1.0_30-09-18</code></p>
<p>添加详细信息标签<br/>
<code>git tag -a v0.1 -m ""version 0.1 released"" 3628164</code></p>
<p>删除标签<br/>
<code>git tag -d Qualitrain_release_1.1_10-10-18</code></p>
<p>删除远程标签<br/>
<code>git push origin :refs/tags/Qualitrain_release_1.1_10-10-18</code></p>
<p>推送某个标签到远程<br/>
<code>git push origin Qualitrain_release_1.1.1_11-12-18</code></p>
<p>推送所有标签<br/>
<code>git push origin --tags</code></p>
<p>删除 untracked files<br/>
<code>git clean -f</code></p>
<p>连 untracked 的目录也一起删掉<br/>
<code>git clean -fd</code></p>
<p>先<br/>
<code>git submodule init </code><br/>
然后<br/>
<code>git submodule update</code></p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(24,'Homebrew常用命令','homebrew',1574078400,1574078400,'<p>Homebrew是一款Mac OS平台下的软件包管理工具，拥有安装、卸载、更新、查看、搜索等很多实用的功能。简单的一条指令，就可以实现包管理，而不用你关心各种依赖和文件路径的情况，十分方便快捷。</p>
<!-- more -->
<p>brew常用命令</p>
<pre><code>//安装依赖工具
xcode-select --install
</code></pre>
<pre><code>//安装
/usr/bin/ruby -e ""$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)""
</code></pre>
<pre><code>//查看帮助信息
brew help

//查看版本
brew -v

//更新Homebrew自己
brew update
</code></pre>
<pre><code>//安装软件包
brew install [包名]

//安装git
brew install git

//安装git-lfs
brew install git-lfs

//安装wget
brew install wget

//安装openssl
brew install openssl
</code></pre>
<pre><code>//查询可更新的包
brew outdated

//更新所有包
brew upgrade

//更新指定包
brew upgrade [包名]
</code></pre>
<pre><code>//清理所有包的旧版本
brew cleanup 

//清理指定包的旧版本
brew cleanup [包名]

//查看可清理的旧版本包，不执行实际操作
brew cleanup -n 
</code></pre>
<pre><code>//锁定某个包，锁定不想更新的包
brew pin $FORMULA
  
//取消锁定
brew unpin $FORMULA   
</code></pre>
<pre><code>//卸载安装包
brew uninstall [包名]

//例：卸载git
brew uninstall git 
</code></pre>
<pre><code>//查看包信息
brew info [包名]

//查看安装列表
brew list

//查询可用包
brew search [包名]
</code></pre>
<pre><code>//卸载Homebrew
/usr/bin/ruby -e ""$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/uninstall)""
</code></pre>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(25,'中国月亮','china-moon',1571140800,1571140800,'<p>海上生明月，天涯共此时。</p>
<!-- more -->
<p><video class="hor-player" controls="" playsinline="" poster="https://file.winston.ink/video/china-moon.jpg" preload="metadata" src="https://file.winston.ink/video/china-moon.mp4">海上生明月，天涯共此时。</video></p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(26,'西江月','xi-jiang-yue',1570881600,1570881600,'<p>前两日，偶遇一首《西江月》，读后万千感慨，结合前段时间所读《红楼梦》，不胜唏嘘。</p>
<!-- more -->
<center>
西江月·世事短如春梦(朱敦儒)<br/>
世事短如春梦，人情薄似秋云。不须计较苦劳心。万事原来有命。<br/>
幸遇三杯酒好，况逢一朵花新。片时欢笑且相亲。明日阴晴未定。
</center><br/>
<p>世事短如春梦。庞大的贾府说衰落就衰落了。陋室空堂，当年笏满床，衰草枯杨，曾为歌舞场。宝玉也是历经世间繁华，集宠爱于一身。在面对家族的落魄，也是无法扭转。加之黛玉的离世，也是心灰意冷。忽喇喇似大厦倾，落得白茫茫一片真干净。真是浮生如梦，仿佛曾经的繁华像似幻影。</p>
<p>人情薄似秋云。《红楼梦》之所以经久不衰的一个原因是众生百态，作者描绘的这么多的人物，还是比较客观，没有什么好人坏人之说。当然除了贾雨村和赵姨娘除外。我们不提贾雨村不去搭救香菱。就说贾芸为了在贾府谋一个差事，就去舅舅家卜世仁借钱或者赊点冰片。当然不帮是本分，帮是情分。但是舅母尖酸刻薄、冷嘲热讽的嘴脸真是够够的。不由的想到”世情薄，人情恶“这句词。</p>
<p>不须计较苦劳心，万事原来有命。当我读到贾宝玉梦游太虚幻境，他发现金陵三十六钗的判词的时候。才发现大观园的姊妹的命运早已安排的明明白白。天地不仁以万物为刍狗，然而冥冥之中天注定。众生如蝼蚁，似棋子，仿佛无形之中被一只手操控着。甄士隐其人淡泊名利、乐善好施，最终也是落的个骨肉分离，家破人亡。一切的求一切皆是命数。</p>
<p>幸遇三杯酒好，况逢一朵花新。读到这一句的时候，我的脑海中尽然蹦出一个让人意想不到的人，人称呆霸王——薛蟠。这也许是鬼使神差了，会把一个纨绔子弟与这句词相连。我读红楼梦，感觉薛蟠其人较真，他是那种没有经历过生活的毒打、一个被宠坏的富家子弟。在纵奴打死冯渊，仍然安心的进京，也算是乐天派人物。薛蟠在调戏柳湘莲后，被柳毒打一顿。后来出外经商，途中遇到土匪，幸得柳湘莲相助。此后便于柳结成生死兄弟。薛蟠其人好热闹，爱分享，心思单纯，蛮横霸道，一个善于及时行乐之人。</p>
<p>片时欢笑且相亲，明日阴晴未定。我看水浒传，当看到征方腊时便不忍心看下去。我看三国演义。当看到关羽败走麦城便不忍心看下去。现在读红楼梦，读到宝玉在大观园与众姊妹们于芦雪庵内即景连诗。此时应该是大观园宝玉姊妹最多的时段。即景连诗起首是凤姐的“一夜北风紧”，便觉是大观园群芳流散之始。不禁想到黛玉的原话：“人有聚，就有散，聚时欢喜到散时岂不冷清？既冷清则生伤感，所以不如倒是不聚的好，比如那花开时令人爱慕，谢时则增惆怅，所以反倒是不开的好。”。</p>
<p>满纸荒唐言，也不知道我在写一些什么。涂鸦于己亥九月十四。</p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(27,'游大观园','grand-view-garden',1570536000,1570536000,'<p>北京大观园位于西城区南菜园西街，是为了拍摄央版《红楼梦》而建。提到大观园，就和《红楼梦》</p>
<!-- more -->
<p>等待增加…</p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(28,'北京的秋','peking-autumn',1567771200,1567771200,'<p>北京的秋天是非常短暂了，仿佛夏天热过之后，冬天就开始冷了起来，让人很难抓住秋天的身影。只有夏末热浪的凉意、满地落叶的堆积、香山红叶的嫣然告诉居住在北京的人们，北京的秋天真是来了。</p>
<!-- more -->
<p>穿梭在高楼大厦之间，仿佛使人们渐渐忘记了秋天是收获的季节。夏末热浪中的丝丝凉意总是让我的思绪回到小时候记忆中的那片金黄色的麦田。孩时麦假的到来，总是给我们在炎热的夏季带来阵阵“清凉”。三五成群，嬉笑怒骂；走在田埂上，走向麦田中，拾取漏网的麦穗。看着满筐的麦穗，脸上总是会露出收获的喜悦笑容。那时候的快乐是如此的简单，风扇、凉席、西瓜也总是对劳作后令人满意的犒劳。时光流逝，白驹过隙。而立将至之年，漂泊在这繁华的都市，收获甚微，过着如行尸走肉般的麻木生活。也许是目标太远，难以触及；也许是欲望过大，沟壑难填；也许是前途漫漫，举步维艰。北京的秋让人熟悉而又陌生，秋天的凉爽如期到来，秋天的收获一片茫然。</p>
<p>古人云：一叶落而知秋。北京的秋天，当然也少不了满地的落叶，这似乎与干净整洁的城区格格不入。它们总是很快地就被扫走，匆匆行人大多也无暇顾及。偶尔的几片落叶飘荡在眼前，这才不由的使人想到秋天是个让人惆怅的季节。漂泊他乡，如落叶、如浮萍、如蒲公英，总是要落叶归根的。然而现在却是留不住的城市，回不去的农村。中秋前，因姥爷的离世而回家奔丧。看着姥爷的遗体如枯叶，没有的往日的精神光彩。想着春节的最后一面，而现在却是阴阳相隔，不由的悲从中来。相对于冬天的万物死寂，而秋天更是让有忧桑的季节。看着落叶飘落，看着万物凋敝。这次第，怎一个愁字了得！</p>
<p>一个人的北京，就会越来越慵懒，闲暇时刻，就是懒得动，“瘫痪”在屋。一直想去八达岭，看看长城的雄伟壮丽；一直想去故宫，看看皇宫的美轮美奂；一直想去香山，看看红叶的火炎焱燚。有诗云：停车坐爱枫林晚，霜叶红于二月花。北京的秋，香山的红叶不仅仅一处景点。同时也是百无聊赖的一丝期望，也是秋风萧瑟中的希望，也是羁旅京畿的灯火。对香山红叶的向往，是对美好生活的一丝期待。自古逢秋悲寂寥，我言秋日胜春朝。晴空一鹤排云上，便引诗情到碧霄。我做不到像刘禹锡前人的洒脱。只有这香山红叶的嫣红埋在在内心的深处。</p>
<p>一场秋雨过后，仿佛使喧嚣的城区变得舒爽宁静。不由地使人赞道：好一个秋天。</p>
<p>————随笔于己亥中秋前</p>
<hr/>
<p>2025年迁移备注：香山是没有红叶的。</p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(29,'Xcode清理垃圾','clean-xcode',1564056000,1564056000,'<p>Xcode真是磁盘杀手，一些缓存的路径。</p>
<!-- more -->
<p><code>1. ~/Library/Developer/Xcode/iOS DeviceSupport/</code></p>
<p>每次把一个设备接入电脑进行真机调试之前，电脑会对设备建立索引，也在此文件夹下生成对该设备系统的支持文件。于是这里存在了一堆对旧版本iOS设备支持的文件。删除不需要的版本文件夹。</p>
<p><code>2. ~/Library/Developer/Xcode/DerivedData/</code></p>
<p>这个文件夹中保存的是Xcode的缓存文件，曾经在Xcode跑过的所有项目的索引、build的信息等都会保存在这里。删除后在下次打开项目编译的时候将会重新生成。由于这里包含了大量已经没用的项目的信息又懒得去筛选，于是把整个文件夹删了。</p>
<p><code>3. ~/Library/Developer/Xcode/Archives/</code></p>
<p>每次打包App的dSYM等数据就保存在这里，把一些没用的版本删了。如果是上线了的版本还是保留吧。</p>
<p><code>4. ~/Library/Developer/Xcode/Products/</code></p>
<p>同上，把没用的删了。</p>
<p><code>5. ~/Library/Developer/CoreSimulator/Devices/</code></p>
<p>一堆模拟器的数据。每个文件夹里包含的就是一个特定系统版本的设备的数据。每个文件夹对应哪个设备可以在其下device.plist中查看。亲测删除之后的效果跟在模拟器里重置相同。省得一个个去重置了，删吧。</p>
<p><code>6. ~/Library/Developer/XCPGDevices/</code></p>
<p>这里保存了playground的项目缓存。全删了。</p>
<p><code>7. ~/Library/MobileDevice/Provisioning Profiles</code></p>
<p>Xcode的描述文件，不建议删除。</p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(30,'Flutter 1.2.1 的安装','flutter-install',1556539200,1556539200,'<p>Flutter 是 Google 于 2017 年推出的开源跨平台 UI 开发工具包，采用 Dart 语言开发，凭借一套代码可同时适配 Android、iOS、网页、Windows、macOS、Linux 六大平台，大幅降低多端开发与维护成本。</p>
<!-- more -->
<p>它依托 Skia 自绘图形引擎，不依赖系统原生控件，界面在各平台视觉完全统一；代码可编译为原生机器码，动画流畅稳定，能稳定达到 60 帧高性能表现。配套热重载功能，修改界面可实时预览，迭代效率极高。<br/>
框架内置丰富的 Material、Cupertino 两套组件库，支持自定义复杂动画与交互。项目完全开源免费，由 Google 持续维护，拥有庞大全球开发者生态，广泛用于电商、社交、工具类应用开发，是当下主流跨端开发方案。</p>
<ol>
<li>flutter.cn 下载Flutter 1.2.1的安装包</li>
<li>配置本地环境，使 flutter 命令可以运行</li>
</ol>
<pre><code>export PUB_HOSTED_URL=https://pub.flutter-io.cn
export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
export PATH="~/Developer/flutter/bin:$PATH"
</code></pre>
<ol start="3">
<li>安装 Xcode 和 Android Studio，并且都运行一次</li>
<li>执行 flutter doctor 命令</li>
<li>执行 flutter create new_project 命令</li>
</ol>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(31,'TableView重用','uitableview-reuse',1514980800,1514980800,'<pre><code>Cell注册的两种方式
1.tableView registerNib:(nullable UINib *) forCellReuseIdentifier:(nonnull NSString *)
2.tableView registerClass:(nullable Class) forCellReuseIdentifier:(nonnull NSString *)
Cell注册的形式：
(1)系统cell
    1.注册
    [self.tableView registerClass:[UITableViewCell class] forCellReuseIdentifier:@"cell"];
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"cell" forIndexPath:indexPath];
    2.不注册
    UITableViewCell *cell=[tableView dequeueReusableCellWithIdentifier:@"cell"];
    if (cell==nil) {
        cell=[[UITableViewCell alloc]initWithStyle:UITableViewCellStyleDefault reuseIdentifier:@"cell"];
    }
(2)自定义cell
    1.注册
    [self.tableView registerClass:[xxxxCell class] forCellReuseIdentifier:@"cell"];
    xxxxCell *cell = [tableView dequeueReusableCellWithIdentifier:@"cell" forIndexPath:indexPath];
  2.不注册
    xxxxCell *cell=[tableView dequeueReusableCellWithIdentifier:@"cell"];
    if (cell==nil) {
        cell=[[xxxxCell alloc]initWithStyle:UITableViewCellStyleDefault reuseIdentifier:@"cell"];
    }
(3)自定义cellXib注册
    1.注册
    [tableView registerNib:[UINib nibWithNibName:@"xxxxViewCell" bundle:nil] forCellReuseIdentifier:@"Cell"];
    xxxxCell *cell = [tableView dequeueReusableCellWithIdentifier:@"Cell" forIndexPath:indexPath];
    2.不注册
     xxxxCell *cell=[tableView dequeueReusableCellWithIdentifier:@"cell"];
    if (cell == nil) {
        cell=[[[NSBundle mainBundle]loadNibNamed:@“xxxxCell" owner:self options:nil]lastObject];
    }
(4)storyboard自定义cell
    简述：在storyBoard中拖出一个TableViewController，编辑controller上的Cell，可以拖出Imageview和Label，然后建立一个基于UITableViewCell类xxxxViewCell，将StoryBoard上的空间拖对应的属性到xxxxViewCell的.h文件中,同时在StoryBoard中选中TableView—&gt;content设置是动态cell Dynamic Prototypes 还是静态cell Static Cells同时可以设置Cell的rows height，然后选中Cell关联创建的Cell类xxxxViewCell同时设置Identifider 如：cellId
    复用：
    xxxxViewCell * cell = [tableView dequeueReusableCellWithIdentifier:@"cellId" forIndexPath:indexPath];



自测版本
在iOS9.3和iOS8.1下测试，只要为tableview注册了相应的cell类，无论用两种方法中的哪一种，都不用手动创建就能获得cell，不会为nil。
然而如果没有为tableview注册cell类，则dequeueReusableCellWithIdentifier:forIndexPath:会crash，crash原因为“must register a nib or a class for the identifier or connect a prototype cell in a storyboard”，即dequeueReusableCellWithIdentifier:forIndexPath:方法必须与register方法配套使用。
但如果没有为tableview注册cell类，dequeueReusableCellWithIdentifier:方法也不会崩溃，只是会返回nil，此时需要我们手动创建cell，如果未创建，则程序会crash，crash原因为“UITableView failed to obtain a cell from its dataSource”，即此时tableView无法获取到cell实例。
</code></pre>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(32,'UIView的一些调用','uiview-function',1514980800,1514980800,'<p>layoutSubviews总结</p>
<p>ios layout机制相关方法</p>
<ul>
<li>
<p>(CGSize)sizeThatFits:(CGSize)size</p>
</li>
<li>
<p>(void)sizeToFit<br/>
——————</p>
</li>
<li>
<p>(void)layoutSubviews</p>
</li>
<li>
<p>(void)layoutIfNeeded</p>
</li>
<li>
<p>(void)setNeedsLayout<br/>
——————–</p>
</li>
<li>
<p>(void)setNeedsDisplay</p>
</li>
<li>
<p>(void)drawRect<br/>
layoutSubviews在以下情况下会被调用：</p>
</li>
</ul>
<p>1、init初始化不会触发layoutSubviews</p>
<p>   但是是用initWithFrame 进行初始化时，当rect的值不为CGRectZero时,也会触发</p>
<p>2、addSubview会触发layoutSubviews</p>
<p>3、设置view的Frame会触发layoutSubviews，当然前提是frame的值设置前后发生了变化</p>
<p>4、滚动一个UIScrollView会触发layoutSubviews</p>
<p>5、旋转Screen会触发父UIView上的layoutSubviews事件</p>
<p>6、改变一个UIView大小的时候也会触发父UIView上的layoutSubviews事件</p>
<p>在苹果的官方文档中强调:</p>
<p>      You should override this method only if the autoresizing behaviors of the subviews do not offer the behavior you want.</p>
<p>layoutSubviews, 当我们在某个类的内部调整子视图位置时，需要调用。</p>
<p>反过来的意思就是说：如果你想要在外部设置subviews的位置，就不要重写。</p>
<p>刷新子对象布局</p>
<p>-layoutSubviews方法：这个方法，默认没有做任何事情，需要子类进行重写<br/>
-setNeedsLayout方法： 标记为需要重新布局，异步调用layoutIfNeeded刷新布局，不立即刷新，但layoutSubviews一定会被调用<br/>
-layoutIfNeeded方法：如果，有需要刷新的标记，立即调用layoutSubviews进行布局（如果没有标记，不会调用layoutSubviews）</p>
<p>如果要立即刷新，要先调用[view setNeedsLayout]，把标记设为需要布局，然后马上调用[view layoutIfNeeded]，实现布局</p>
<p>在视图第一次显示之前，标记总是“需要刷新”的，可以直接调用[view layoutIfNeeded]</p>
<p>重绘</p>
<p>-drawRect:(CGRect)rect方法：重写此方法，执行重绘任务<br/>
-setNeedsDisplay方法：标记为需要重绘，异步调用drawRect<br/>
-setNeedsDisplayInRect:(CGRect)invalidRect方法：标记为需要局部重绘</p>
<p>sizeToFit会自动调用sizeThatFits方法；</p>
<p>sizeToFit不应该在子类中被重写，应该重写sizeThatFits</p>
<p>sizeThatFits传入的参数是receiver当前的size，返回一个适合的size</p>
<p>sizeToFit可以被手动直接调用</p>
<p>sizeToFit和sizeThatFits方法都没有递归，对subviews也不负责，只负责自己</p>
<p>———————————-</p>
<p>layoutSubviews对subviews重新布局</p>
<p>layoutSubviews方法调用先于drawRect</p>
<p>setNeedsLayout在receiver标上一个需要被重新布局的标记，在系统runloop的下一个周期自动调用layoutSubviews</p>
<p>layoutIfNeeded方法如其名，UIKit会判断该receiver是否需要layout.根据Apple官方文档,layoutIfNeeded方法应该是这样的</p>
<p>layoutIfNeeded遍历的不是superview链，应该是subviews链</p>
<p>drawRect是对receiver的重绘，能获得context</p>
<p>setNeedDisplay在receiver标上一个需要被重新绘图的标记，在下一个draw周期自动重绘，iphone device的刷新频率是60hz，也就是1/60秒后重绘</p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(33,'属性声明','ios-property',1513339200,1513339200,'<p>delegate为什么要用weak或者assign而不用strong</p>
<p>a创建对象b,b中有C类对象c，所以a对b有一个引用,b对c有一个引用，a.b引用计数分别为1，1。当c.delegate = b的时候，实则是对b有了一个引用，如果此时c的delegate用strong修饰则会对b的值内存引用计数+1，b引用计数为2。当a的生命周期结束，随之释放对b的引用，b的引用计数变为1，导致b不能释放，b不能释放又导致b对c的引用不能释放，c引用计数还是为1，这样就造成了b和c一直留在了内存中。<br/>
而要解决这个问题就是使用weak或者assign修饰delegate，这样虽然会有c仍然会对b有一个引用，但是引用是弱引用，当a生命周期结束的时候，b的引用计数变为0，b释放后随之c的引用消失，c引用计数变为0，释放。</p>
<p>原文链接:<br/>
<a href="http://www.jianshu.com/p/f9eb6b315c08">http://www.jianshu.com/p/f9eb6b315c08</a></p>
<p>可变变量中，copy是重新开辟一个内存，strong，weak，assgin后三者不开辟内存，只是指针指向原来保存值的内存的位置，storng指向后会对该内存引用计数+1，而weak，assgin不会。weak，assgin会在引用保存值的内存引用计数为0的时候值为空，并且weak会将内存值设为nil，assign不会，assign在内存没有被重写前依旧可以输出，但一旦被重写将出现奔溃<br/>
不可变变量中，因为值本身不可被改变，copy没必要开辟出一块内存存放和原来内存一模一样的值，所以内存管理系统默认都是浅拷贝。其他和可变变量一样，如weak修饰的变量同样会在内存引用计数为0时变为nil。<br/>
容器本身遵守上面准则，但容器内部的每个值都是浅拷贝。<br/>
综上所述，当创建property构造器创建变量value1的时候，使用copy，strong，weak，assign根据具体使用情况来决定。value1 = value2，如果你希望value1和value2的修改不会互相影响的就用用copy，反之用strong、weak、assign。如果你还希望原来值C(C是什么见示意图1)为nil的时候，你的变量不为nil就用strong,反之用weak和assign。weak和assign保证了不强引用某一块内存，如delegate我们就用weak表示，就是为了防止循环引用的产生</p>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(34,'一些路径','some-path',1513339200,1513339200,'<p>记录一些软件或者软件缓存的路径</p>
<!-- more -->
<pre><code>npm：/usr/local/lib

gem：/Library/Ruby/Gems/

cocoapod：~/.cocoapods

hosts：/etc/hosts

profile：~/Library/MobileDevice/Provisioning Profiles

ImageDisk：/Xcode/Contents/Developer/Platforms/iPhoneOS.platform/DeviceSupport
</code></pre>','post','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(35,'关于','about',1422446400,1422446400,'<p><strong>关于本站：</strong><br/>
本来是想记录一些技术笔记，<br/>
但是往往直接Google或者把别人博客收藏到书签中，<br/>
又不是不能用[捂脸哭]。<br/>
最后也只能随便写一些牢骚放在上面(反正也没人看)。</p>
<p><strong>本站配置：</strong><br/>
框架：<del><a href="http://typecho.org" target="_blank">Typecho</a></del> → <del><a href="https://github.com/getgridea/gridea" target="_blank">Gridea</a></del> → <a href="https://github.com/Gridea-Pro/gridea-pro" target="_blank">Gridea Pro</a><br/>
主题：<del><a href="https://github.com/jielive/initial" target="_blank">Initial</a></del> → <del><a href="https://github.com/getgridea/gridea-theme-fly" target="_blank">Fly</a></del> → <a href="https://github.com/Gridea-Pro/gridea-pro-themes/tree/main/themes/kehua" target="_blank">Kehua</a><br/>
主机：<del><a href="https://www.aliyun.com/" target="_blank">万网虚拟主机</a></del> → <a href="https://pages.github.com/" target="_blank">GitHub Pages</a></p>
<p><strong>本站历程：</strong></p>
<ul>
<li>开始接触的是静态博客Hexo，但是当初太麻烦了。</li>
<li>就从动态博客Typecho入手，中间经历过备案，升级成https，使用了几年也没写几篇博客，反而主机、域名都需要花钱。最不能接受的是https免费证书从之前的有效期一年变成现在的三个月，简直是丧心病狂。</li>
<li>所以2025初转入Gridea静态博客，兜兜转转又回来了。主要是博客更新频率低，另外GitHub不倒Pages不倒(小树不倒我不倒)。</li>
<li>2026年6月16日左右，由Gridea迁移到Gridea Pro，后者有新功能闪念。</li>
</ul>
<p><strong>个人简介：</strong><br/>
网名：濮水舞蝶(《庄子钓于濮水》、《庄周梦蝶》)<br/>
格言：Stay Young Stay Simple. (孜孜以求、勿忘初心)</p>','page','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(36,'','memo-2026-07-10-1',1783706400,1783706400,'<p><img alt="洱海" class="hor-image" src="https://file.winston.ink/image/er-hai.jpg"/></p>
<p>#图片</p>','memo','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(37,'','memo-2026-06-29-1',1782756000,1782756000,'<p><video class="ver-player" controls="" playsinline="" poster="https://file.winston.ink/video/jun-ge-2605031.jpg" preload="metadata" src="https://file.winston.ink/video/jun-ge-2605031.mp4">珺哥</video></p>
<p>#视频</p>','memo','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(38,'','memo-2026-06-28-1',1782669600,1782669600,'<p>刚需？我认为空气、水、食物才是刚需，其他的都是欲望。</p>
<p>#日常</p>','memo','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(39,'','memo-2026-06-18-1',1781805600,1781805600,'<p>最近在追<a href="https://www.bilibili.com/video/BV1K5V46REDU" target="_blank">楚人美游记</a>，挺有意思的，看来AI将会对影视业有很大的冲击。</p>
<p>#视频</p>','memo','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(40,'','memo-2026-06-18-2',1781805599,1781805599,'<p>最终选择了<a href="https://github.com/Gridea-Pro/gridea-pro-themes/tree/main/themes/writecho" target="_blank">Writecho</a>主题，排版比较美观。</p>
<p>#博客</p>','memo','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(41,'','memo-2026-06-16-1',1781632800,1781632800,'<p>为了闪念，从<a href="https://github.com/getgridea/gridea" target="_blank">Gridea</a>切换到<a href="https://github.com/Gridea-Pro/gridea-pro" target="_blank">Gridea Pro</a>。</p>
<p>#博客</p>','memo','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(42,'anydesk.jpg','seed-post-images-anydesk.jpg',1783653254,1783653254,'{"key":"seed/post-images/anydesk.jpg","url":"https://winston.ink/post-images/anydesk.jpg","mime":"image/jpeg","size":48518,"parentCid":null,"originalName":"anydesk.jpg"}','attachment','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(43,'bandizip.jpg','seed-post-images-bandizip.jpg',1783653254,1783653254,'{"key":"seed/post-images/bandizip.jpg","url":"https://winston.ink/post-images/bandizip.jpg","mime":"image/jpeg","size":76716,"parentCid":null,"originalName":"bandizip.jpg"}','attachment','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(44,'clipdiary.jpg','seed-post-images-clipdiary.jpg',1783653254,1783653254,'{"key":"seed/post-images/clipdiary.jpg","url":"https://winston.ink/post-images/clipdiary.jpg","mime":"image/jpeg","size":37289,"parentCid":null,"originalName":"clipdiary.jpg"}','attachment','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(45,'faststone-capture.jpg','seed-post-images-faststone-capture.jpg',1783653254,1783653254,'{"key":"seed/post-images/faststone-capture.jpg","url":"https://winston.ink/post-images/faststone-capture.jpg","mime":"image/jpeg","size":109507,"parentCid":null,"originalName":"faststone-capture.jpg"}','attachment','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(46,'ios-interview.pdf','seed-post-images-ios-interview.pdf',1783653254,1783653254,'{"key":"seed/post-images/ios-interview.pdf","url":"https://winston.ink/post-images/ios-interview.pdf","mime":"application/pdf","size":3421738,"parentCid":null,"originalName":"ios-interview.pdf"}','attachment','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(47,'ios-outline.png','seed-post-images-ios-outline.png',1783653254,1783653254,'{"key":"seed/post-images/ios-outline.png","url":"https://winston.ink/post-images/ios-outline.png","mime":"image/png","size":203272,"parentCid":null,"originalName":"ios-outline.png"}','attachment','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(48,'link-avatar-cf.jpg','seed-post-images-link-avatar-cf.jpg',1783653254,1783653254,'{"key":"seed/post-images/link-avatar-cf.jpg","url":"https://winston.ink/post-images/link-avatar-cf.jpg","mime":"image/jpeg","size":2879,"parentCid":null,"originalName":"link-avatar-cf.jpg"}','attachment','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(49,'link-avatar-cipher.jpg','seed-post-images-link-avatar-cipher.jpg',1783653254,1783653254,'{"key":"seed/post-images/link-avatar-cipher.jpg","url":"https://winston.ink/post-images/link-avatar-cipher.jpg","mime":"image/jpeg","size":4574,"parentCid":null,"originalName":"link-avatar-cipher.jpg"}','attachment','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(50,'link-avatar-google.jpg','seed-post-images-link-avatar-google.jpg',1783653254,1783653254,'{"key":"seed/post-images/link-avatar-google.jpg","url":"https://winston.ink/post-images/link-avatar-google.jpg","mime":"image/jpeg","size":3255,"parentCid":null,"originalName":"link-avatar-google.jpg"}','attachment','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(51,'link-avatar-x.jpg','seed-post-images-link-avatar-x.jpg',1783653254,1783653254,'{"key":"seed/post-images/link-avatar-x.jpg","url":"https://winston.ink/post-images/link-avatar-x.jpg","mime":"image/jpeg","size":3351,"parentCid":null,"originalName":"link-avatar-x.jpg"}','attachment','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(52,'palm-input.jpg','seed-post-images-palm-input.jpg',1783653254,1783653254,'{"key":"seed/post-images/palm-input.jpg","url":"https://winston.ink/post-images/palm-input.jpg","mime":"image/jpeg","size":38122,"parentCid":null,"originalName":"palm-input.jpg"}','attachment','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(53,'paste-app.jpg','seed-post-images-paste-app.jpg',1783653254,1783653254,'{"key":"seed/post-images/paste-app.jpg","url":"https://winston.ink/post-images/paste-app.jpg","mime":"image/jpeg","size":70457,"parentCid":null,"originalName":"paste-app.jpg"}','attachment','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(54,'peking-autumn.jpg','seed-post-images-peking-autumn.jpg',1783653254,1783653254,'{"key":"seed/post-images/peking-autumn.jpg","url":"https://winston.ink/post-images/peking-autumn.jpg","mime":"image/jpeg","size":97417,"parentCid":null,"originalName":"peking-autumn.jpg"}','attachment','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(55,'tim.jpg','seed-post-images-tim.jpg',1783653254,1783653254,'{"key":"seed/post-images/tim.jpg","url":"https://winston.ink/post-images/tim.jpg","mime":"image/jpeg","size":43009,"parentCid":null,"originalName":"tim.jpg"}','attachment','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(56,'win-rename.jpg','seed-post-images-win-rename.jpg',1783653254,1783653254,'{"key":"seed/post-images/win-rename.jpg","url":"https://winston.ink/post-images/win-rename.jpg","mime":"image/jpeg","size":67101,"parentCid":null,"originalName":"win-rename.jpg"}','attachment','publish');
INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES(57,'avatar.png','seed-images-avatar.png',1783653254,1783653254,'{"key":"seed/images/avatar.png","url":"https://winston.ink/images/avatar.png","mime":"image/png","size":15304,"parentCid":null,"originalName":"avatar.png"}','attachment','publish');

INSERT INTO blog_metas(mid,name,slug,type,description,count) VALUES(1,'笔记','note','category','',0);
INSERT INTO blog_metas(mid,name,slug,type,description,count) VALUES(2,'随笔','write','category','',0);
INSERT INTO blog_metas(mid,name,slug,type,description,count) VALUES(3,'分享','share','category','',0);
INSERT INTO blog_metas(mid,name,slug,type,description,count) VALUES(4,'教程','tutorial','tag','',0);
INSERT INTO blog_metas(mid,name,slug,type,description,count) VALUES(5,'散文','prose','tag','',0);
INSERT INTO blog_metas(mid,name,slug,type,description,count) VALUES(6,'软件','app','tag','',0);
INSERT INTO blog_metas(mid,name,slug,type,description,count) VALUES(7,'电视','drama','tag','',0);
INSERT INTO blog_metas(mid,name,slug,type,description,count) VALUES(8,'电影','movie','tag','',0);
INSERT INTO blog_metas(mid,name,slug,type,description,count) VALUES(9,'开发','develop','tag','',0);
INSERT INTO blog_metas(mid,name,slug,type,description,count) VALUES(10,'音乐','music','tag','',0);

INSERT INTO blog_relationships(cid,mid) VALUES(1,1);
INSERT INTO blog_relationships(cid,mid) VALUES(1,4);
INSERT INTO blog_relationships(cid,mid) VALUES(2,1);
INSERT INTO blog_relationships(cid,mid) VALUES(2,4);
INSERT INTO blog_relationships(cid,mid) VALUES(3,1);
INSERT INTO blog_relationships(cid,mid) VALUES(3,4);
INSERT INTO blog_relationships(cid,mid) VALUES(4,1);
INSERT INTO blog_relationships(cid,mid) VALUES(4,4);
INSERT INTO blog_relationships(cid,mid) VALUES(5,1);
INSERT INTO blog_relationships(cid,mid) VALUES(5,4);
INSERT INTO blog_relationships(cid,mid) VALUES(6,2);
INSERT INTO blog_relationships(cid,mid) VALUES(6,5);
INSERT INTO blog_relationships(cid,mid) VALUES(7,3);
INSERT INTO blog_relationships(cid,mid) VALUES(7,6);
INSERT INTO blog_relationships(cid,mid) VALUES(8,3);
INSERT INTO blog_relationships(cid,mid) VALUES(8,6);
INSERT INTO blog_relationships(cid,mid) VALUES(9,3);
INSERT INTO blog_relationships(cid,mid) VALUES(9,6);
INSERT INTO blog_relationships(cid,mid) VALUES(10,3);
INSERT INTO blog_relationships(cid,mid) VALUES(10,6);
INSERT INTO blog_relationships(cid,mid) VALUES(11,3);
INSERT INTO blog_relationships(cid,mid) VALUES(11,6);
INSERT INTO blog_relationships(cid,mid) VALUES(12,3);
INSERT INTO blog_relationships(cid,mid) VALUES(12,6);
INSERT INTO blog_relationships(cid,mid) VALUES(13,3);
INSERT INTO blog_relationships(cid,mid) VALUES(13,6);
INSERT INTO blog_relationships(cid,mid) VALUES(14,3);
INSERT INTO blog_relationships(cid,mid) VALUES(14,6);
INSERT INTO blog_relationships(cid,mid) VALUES(15,3);
INSERT INTO blog_relationships(cid,mid) VALUES(15,7);
INSERT INTO blog_relationships(cid,mid) VALUES(16,3);
INSERT INTO blog_relationships(cid,mid) VALUES(16,8);
INSERT INTO blog_relationships(cid,mid) VALUES(17,3);
INSERT INTO blog_relationships(cid,mid) VALUES(17,7);
INSERT INTO blog_relationships(cid,mid) VALUES(18,3);
INSERT INTO blog_relationships(cid,mid) VALUES(18,8);
INSERT INTO blog_relationships(cid,mid) VALUES(19,3);
INSERT INTO blog_relationships(cid,mid) VALUES(19,7);
INSERT INTO blog_relationships(cid,mid) VALUES(20,1);
INSERT INTO blog_relationships(cid,mid) VALUES(20,9);
INSERT INTO blog_relationships(cid,mid) VALUES(21,1);
INSERT INTO blog_relationships(cid,mid) VALUES(21,4);
INSERT INTO blog_relationships(cid,mid) VALUES(22,1);
INSERT INTO blog_relationships(cid,mid) VALUES(22,9);
INSERT INTO blog_relationships(cid,mid) VALUES(23,1);
INSERT INTO blog_relationships(cid,mid) VALUES(23,4);
INSERT INTO blog_relationships(cid,mid) VALUES(24,1);
INSERT INTO blog_relationships(cid,mid) VALUES(24,4);
INSERT INTO blog_relationships(cid,mid) VALUES(25,3);
INSERT INTO blog_relationships(cid,mid) VALUES(25,10);
INSERT INTO blog_relationships(cid,mid) VALUES(26,2);
INSERT INTO blog_relationships(cid,mid) VALUES(26,5);
INSERT INTO blog_relationships(cid,mid) VALUES(27,2);
INSERT INTO blog_relationships(cid,mid) VALUES(27,5);
INSERT INTO blog_relationships(cid,mid) VALUES(28,2);
INSERT INTO blog_relationships(cid,mid) VALUES(28,5);
INSERT INTO blog_relationships(cid,mid) VALUES(29,1);
INSERT INTO blog_relationships(cid,mid) VALUES(29,4);
INSERT INTO blog_relationships(cid,mid) VALUES(30,1);
INSERT INTO blog_relationships(cid,mid) VALUES(30,4);
INSERT INTO blog_relationships(cid,mid) VALUES(31,1);
INSERT INTO blog_relationships(cid,mid) VALUES(31,9);
INSERT INTO blog_relationships(cid,mid) VALUES(32,1);
INSERT INTO blog_relationships(cid,mid) VALUES(32,9);
INSERT INTO blog_relationships(cid,mid) VALUES(33,1);
INSERT INTO blog_relationships(cid,mid) VALUES(33,9);
INSERT INTO blog_relationships(cid,mid) VALUES(34,1);
INSERT INTO blog_relationships(cid,mid) VALUES(34,9);

INSERT INTO blog_links(id,name,url,icon,info,"order") VALUES(1,'Google','https://www.google.com','https://winston.ink/post-images/link-avatar-google.jpg','',5);
INSERT INTO blog_links(id,name,url,icon,info,"order") VALUES(2,'X','https://x.com','https://winston.ink/post-images/link-avatar-x.jpg','',4);
INSERT INTO blog_links(id,name,url,icon,info,"order") VALUES(3,'Cipher','https://braum.pythonanywhere.com','https://winston.ink/post-images/link-avatar-cipher.jpg','',3);
INSERT INTO blog_links(id,name,url,icon,info,"order") VALUES(4,'CFLane','https://lane.winston.ink','https://winston.ink/post-images/link-avatar-cf.jpg','',2);
INSERT INTO blog_links(id,name,url,icon,info,"order") VALUES(5,'CFDisk','https://disk.winston.ink','https://winston.ink/post-images/link-avatar-cf.jpg','',1);

INSERT INTO blog_options(name,value) VALUES('site_title','Winston');
INSERT INTO blog_options(name,value) VALUES('site_description','Stay Young Stay Simple');
INSERT INTO blog_options(name,value) VALUES('posts_per_page','8');
INSERT INTO blog_options(name,value) VALUES('memos_per_page','10');
INSERT INTO blog_options(name,value) VALUES('about_slug','about');
INSERT INTO blog_options(name,value) VALUES('footer_text','Stay Young Stay Simple');
INSERT INTO blog_options(name,value) VALUES('site_timezone','Asia/Shanghai');
INSERT INTO blog_options(name,value) VALUES('date_format','zh-CN');
INSERT INTO blog_options(name,value) VALUES('favicon_text','W');
INSERT INTO blog_options(name,value) VALUES('favicon_color','#999999');
INSERT INTO blog_options(name,value) VALUES('about_avatar','https://winston.ink/images/avatar.png');
INSERT INTO blog_options(name,value) VALUES('about_github','https://github.com/braumhuang');
INSERT INTO blog_options(name,value) VALUES('about_x','https://x.com/braumhuang');
INSERT INTO blog_options(name,value) VALUES('about_rss','https://winston.ink/feed.xml');
INSERT INTO blog_options(name,value) VALUES('about_email','');

-- Seed summary
-- posts/pages: 35; memos: 6; attachments: 16;
-- categories: 3; tags: 7; links: 5.
