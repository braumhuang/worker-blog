import type { OptionMap } from '../types'
import { dbAll } from './db'
import { normalizeFaviconColor, normalizeFaviconText } from './favicon'

export const TIMEZONE_OPTIONS = [
  ['Pacific/Pago_Pago', 'UTC−11:00 萨摩亚'],
  ['Pacific/Honolulu', 'UTC−10:00 夏威夷'],
  ['America/Anchorage', 'UTC−09:00 阿拉斯加'],
  ['America/Los_Angeles', 'UTC−08:00 美国太平洋时间'],
  ['America/Denver', 'UTC−07:00 美国山地时间'],
  ['America/Chicago', 'UTC−06:00 美国中部时间'],
  ['America/New_York', 'UTC−05:00 美国东部时间'],
  ['America/Halifax', 'UTC−04:00 大西洋时间'],
  ['America/Sao_Paulo', 'UTC−03:00 巴西利亚'],
  ['Atlantic/South_Georgia', 'UTC−02:00 南乔治亚'],
  ['Atlantic/Azores', 'UTC−01:00 亚速尔'],
  ['UTC', 'UTC±00:00 协调世界时'],
  ['Europe/London', 'UTC+00:00 伦敦'],
  ['Europe/Berlin', 'UTC+01:00 中欧时间'],
  ['Europe/Athens', 'UTC+02:00 东欧时间'],
  ['Europe/Moscow', 'UTC+03:00 莫斯科'],
  ['Asia/Tehran', 'UTC+03:30 德黑兰'],
  ['Asia/Dubai', 'UTC+04:00 迪拜'],
  ['Asia/Kabul', 'UTC+04:30 喀布尔'],
  ['Asia/Karachi', 'UTC+05:00 卡拉奇'],
  ['Asia/Kolkata', 'UTC+05:30 印度'],
  ['Asia/Kathmandu', 'UTC+05:45 加德满都'],
  ['Asia/Dhaka', 'UTC+06:00 达卡'],
  ['Asia/Yangon', 'UTC+06:30 仰光'],
  ['Asia/Bangkok', 'UTC+07:00 曼谷'],
  ['Asia/Shanghai', 'UTC+08:00 东八区（北京 / 上海）'],
  ['Asia/Hong_Kong', 'UTC+08:00 香港'],
  ['Asia/Taipei', 'UTC+08:00 台北'],
  ['Asia/Singapore', 'UTC+08:00 新加坡'],
  ['Asia/Tokyo', 'UTC+09:00 东京'],
  ['Australia/Adelaide', 'UTC+09:30 阿德莱德'],
  ['Australia/Sydney', 'UTC+10:00 悉尼'],
  ['Pacific/Noumea', 'UTC+11:00 努美阿'],
  ['Pacific/Auckland', 'UTC+12:00 奥克兰'],
] as const

export const TIMEZONE_VALUES = new Set<string>(TIMEZONE_OPTIONS.map(([value]) => value))

export const DEFAULT_OPTIONS: OptionMap = {
  site_title: 'My Hono Blog',
  site_description: 'Stay Young, Stay Simple.',
  posts_per_page: '10',
  memos_per_page: '20',
  comments_per_page: '20',
  comments_enabled: 'false',
  about_slug: 'about',
  footer_text: 'Stay Young, Stay Simple.',
  site_timezone: 'Asia/Shanghai',
  favicon_text: 'B',
  favicon_color: '#999999',
  about_avatar: '',
  about_github: '',
  about_x: '',
  about_rss: '',
  about_email: '',
}

export async function getOptions(db: D1Database): Promise<OptionMap> {
  const rows = await dbAll<{ key: string; value: string }>(db, 'SELECT "key" AS key, value FROM blog_options')
  const options = Object.assign({}, DEFAULT_OPTIONS, Object.fromEntries(rows.map((row) => [row.key, row.value])))
  options.favicon_color = normalizeFaviconColor(options.favicon_color)
  options.favicon_text = normalizeFaviconText(options.favicon_text, Array.from(options.site_title.trim())[0] || 'B')
  if (!TIMEZONE_VALUES.has(options.site_timezone)) options.site_timezone = DEFAULT_OPTIONS.site_timezone
  options.comments_enabled = options.comments_enabled === 'true' ? 'true' : 'false'
  return options
}

export async function saveOptions(db: D1Database, values: OptionMap): Promise<void> {
  const statements = Object.entries(values).map(([key, value]) =>
    db.prepare(`
      INSERT INTO blog_options("key", value) VALUES(?, ?)
      ON CONFLICT("key") DO UPDATE SET value = excluded.value
    `).bind(key, value),
  )
  if (statements.length) await db.batch(statements)
}
