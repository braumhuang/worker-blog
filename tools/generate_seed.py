#!/usr/bin/env python3
"""Generate seed.sql from an extracted winston.ink static-site directory."""
from __future__ import annotations

import argparse
import json
import mimetypes
import re
from collections import OrderedDict
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

from bs4 import BeautifulSoup

MEDIA_PREFIXES = ('/post-images/', '/images/', '/media/')
SITE_ORIGIN = 'https://winston.ink'


def sql(value: object) -> str:
    if value is None:
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def unix_day(date_text: str, seconds: int = 12 * 3600) -> int:
    date = datetime.strptime(date_text, '%Y-%m-%d').replace(tzinfo=timezone.utc)
    return int(date.timestamp()) + seconds


def media_url(value: str) -> str:
    return SITE_ORIGIN + value if value.startswith(MEDIA_PREFIXES) else value


def normalize_fragment(node) -> str:
    for tag in node.find_all(True):
        for attr in ('src', 'poster', 'href'):
            value = tag.get(attr)
            if isinstance(value, str):
                tag[attr] = media_url(value)
    html = node.decode_contents().strip()
    # BeautifulSoup retains the source's summary marker as an HTML comment.
    return re.sub(r'<!--\s*more\s*-->', '<!-- more -->', html, flags=re.I)


def href_slug(anchor, segment: str) -> str:
    href = anchor.get('href', '') if anchor else ''
    match = re.search(rf'/{re.escape(segment)}/([^/]+)/?', href)
    return match.group(1) if match else ''


def parse_posts(site: Path):
    records = []
    for path in sorted((site / 'post').glob('*/index.html')):
        slug = path.parent.name
        soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
        if slug == 'about':
            content_node = soup.select_one('.about-page .article-content')
            if not content_node:
                continue
            published = '2015-01-28'
            for script in soup.select('script[type=\"application/ld+json\"]'):
                try:
                    payload = json.loads(script.string or '')
                except json.JSONDecodeError:
                    continue
                if payload.get('@type') == 'BlogPosting' and payload.get('datePublished'):
                    published = str(payload['datePublished'])[:10]
                    break
            records.append({
                'title': '关于',
                'slug': slug,
                'created': unix_day(published),
                'text': normalize_fragment(content_node),
                'type': 'page',
                'category': None,
                'tags': [],
            })
            continue

        article = soup.select_one('.article-detail')
        title_node = soup.select_one('.article-title')
        date_node = soup.select_one('.article-date')
        content_node = soup.select_one('.article-content')
        if not (article and title_node and date_node and content_node):
            continue
        category_anchor = soup.select_one('.article-category a')
        category = None
        if category_anchor:
            category = (category_anchor.get_text(' ', strip=True), href_slug(category_anchor, 'category'))
        tags = []
        for anchor in soup.select('.article-tags a.tag'):
            tags.append((anchor.get_text(' ', strip=True), href_slug(anchor, 'tag')))
        records.append({
            'title': title_node.get_text(' ', strip=True),
            'slug': slug,
            'created': unix_day(date_node.get('datetime') or date_node.get_text(strip=True)),
            'text': normalize_fragment(content_node),
            'type': 'post',
            'category': category,
            'tags': tags,
        })
    records.sort(key=lambda row: (-row['created'], row['slug']))
    return records


def parse_memos(site: Path):
    soup = BeautifulSoup((site / 'memos/index.html').read_text(encoding='utf-8'), 'html.parser')
    records = []
    per_day = {}
    for index, item in enumerate(soup.select('.memo-item')):
        content = item.select_one('.memo-content')
        date_node = item.select_one('.memo-date')
        if not (content and date_node):
            continue
        day = date_node.get('datetime') or date_node.get_text(strip=True)
        occurrence = per_day.get(day, 0)
        per_day[day] = occurrence + 1
        records.append({
            'title': '',
            'slug': f'memo-{day}-{occurrence + 1}',
            'created': unix_day(day, 18 * 3600 - occurrence),
            'text': normalize_fragment(content),
            'type': 'memo',
        })
    return records


def parse_links(site: Path):
    soup = BeautifulSoup((site / 'links/index.html').read_text(encoding='utf-8'), 'html.parser')
    rows = []
    cards = soup.select('.links-grid .link-card')
    for index, card in enumerate(cards):
        name_node = card.select_one('.link-card-name')
        info_node = card.select_one('.link-card-desc, .link-card-description, p')
        img = card.select_one('img')
        rows.append({
            'name': name_node.get_text(' ', strip=True) if name_node else card.get_text(' ', strip=True),
            'url': card.get('href', ''),
            'icon': media_url(img.get('src', '')) if img else '',
            'info': info_node.get_text(' ', strip=True) if info_node else '',
            'order': len(cards) - index,
        })
    return rows


def parse_attachments(site: Path):
    paths = []
    for folder in ('post-images', 'images'):
        for path in sorted((site / folder).glob('*')):
            if path.is_file() and not path.name.startswith('.'):
                paths.append((folder, path))
    rows = []
    for folder, path in paths:
        mime = mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
        public_path = f'/{folder}/{path.name}'
        key = f'seed/{folder}/{path.name}'
        rows.append({
            'title': path.name,
            'slug': key.replace('/', '-'),
            'created': int(path.stat().st_mtime),
            'text': json.dumps({
                'key': key,
                'url': SITE_ORIGIN + public_path,
                'mime': mime,
                'size': path.stat().st_size,
                'parentCid': None,
                'originalName': path.name,
            }, ensure_ascii=False, separators=(',', ':')),
            'type': 'attachment',
        })
    return rows


def build_seed(site: Path) -> str:
    posts = parse_posts(site)
    memos = parse_memos(site)
    attachments = parse_attachments(site)
    links = parse_links(site)

    categories: OrderedDict[str, str] = OrderedDict()
    tags: OrderedDict[str, str] = OrderedDict()
    for post in posts:
        if post.get('category'):
            name, slug = post['category']
            categories.setdefault(slug, name)
        for name, slug in post.get('tags', []):
            tags.setdefault(slug, name)

    lines = [
        '-- Generated from winston.ink static-site resources.',
        '-- Development/mock data only. Re-running this file resets all blog data.',
        'PRAGMA foreign_keys = ON;',
        '',
        'DELETE FROM blog_relationships;',
        'DELETE FROM blog_cookies;',
        'DELETE FROM blog_links;',
        'DELETE FROM blog_metas;',
        'DELETE FROM blog_contents;',
        'DELETE FROM blog_options;',
        "DELETE FROM sqlite_sequence WHERE name IN ('blog_contents','blog_metas','blog_links');",
        '',
    ]

    content_ids = {}
    cid = 1
    for row in posts + memos + attachments:
        content_ids[(row['type'], row['slug'])] = cid
        lines.append(
            'INSERT INTO blog_contents(cid,title,slug,created,modified,text,type,status) VALUES('
            + ','.join(map(sql, [cid, row['title'], row['slug'], row['created'], row['created'], row['text'], row['type'], 'publish']))
            + ');'
        )
        cid += 1

    lines.append('')
    meta_ids = {}
    mid = 1
    for meta_type, values in (('category', categories), ('tag', tags)):
        for slug, name in values.items():
            meta_ids[(meta_type, slug)] = mid
            lines.append(
                'INSERT INTO blog_metas(mid,name,slug,type,description,count) VALUES('
                + ','.join(map(sql, [mid, name, slug, meta_type, '', 0]))
                + ');'
            )
            mid += 1

    lines.append('')
    for post in posts:
        cid_value = content_ids[(post['type'], post['slug'])]
        relations = []
        if post.get('category'):
            relations.append(('category', post['category'][1]))
        relations.extend(('tag', slug) for _name, slug in post.get('tags', []))
        for meta_key in relations:
            lines.append(f'INSERT INTO blog_relationships(cid,mid) VALUES({cid_value},{meta_ids[meta_key]});')

    lines.append('')
    for index, link in enumerate(links, start=1):
        lines.append(
            'INSERT INTO blog_links(id,name,url,icon,info,"order") VALUES('
            + ','.join(map(sql, [index, link['name'], link['url'], link['icon'], link['info'], link['order']]))
            + ');'
        )

    options = OrderedDict([
        ('site_title', 'Winston'),
        ('site_description', 'Stay Young Stay Simple'),
        ('posts_per_page', '8'),
        ('memos_per_page', '10'),
        ('about_slug', 'about'),
        ('footer_text', 'Stay Young Stay Simple'),
        ('site_timezone', 'Asia/Shanghai'),
        ('date_format', 'zh-CN'),
    ])
    lines.append('')
    for name, value in options.items():
        lines.append(f'INSERT INTO blog_options(name,value) VALUES({sql(name)},{sql(value)});')

    lines.extend([
        '',
        '-- Seed summary',
        f'-- posts/pages: {len(posts)}; memos: {len(memos)}; attachments: {len(attachments)};',
        f'-- categories: {len(categories)}; tags: {len(tags)}; links: {len(links)}.',
        '',
    ])
    return '\n'.join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('site_dir', type=Path, help='Extracted winston.ink directory')
    parser.add_argument('-o', '--output', type=Path, default=Path('seed.sql'))
    args = parser.parse_args()
    args.output.write_text(build_seed(args.site_dir), encoding='utf-8')
    print(f'Wrote {args.output}')


if __name__ == '__main__':
    main()
