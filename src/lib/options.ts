import type { OptionMap } from '../types'
import { dbAll } from './db'

export const DEFAULT_OPTIONS: OptionMap = {
  site_title: 'My Hono Blog',
  site_description: 'Stay Young, Stay Simple.',
  posts_per_page: '10',
  memos_per_page: '20',
  about_slug: 'about',
  footer_text: 'Stay Young, Stay Simple.',
  site_timezone: 'Asia/Shanghai',
}

export async function getOptions(db: D1Database): Promise<OptionMap> {
  const rows = await dbAll<{ name: string; value: string }>(db, 'SELECT name, value FROM blog_options')
  return Object.assign({}, DEFAULT_OPTIONS, Object.fromEntries(rows.map((row) => [row.name, row.value])))
}

export async function saveOptions(db: D1Database, values: OptionMap): Promise<void> {
  const statements = Object.entries(values).map(([name, value]) =>
    db.prepare(`
      INSERT INTO blog_options(name, value) VALUES(?, ?)
      ON CONFLICT(name) DO UPDATE SET value = excluded.value
    `).bind(name, value),
  )
  if (statements.length) await db.batch(statements)
}
