export async function dbAll<T>(db: D1Database, sql: string, ...values: unknown[]): Promise<T[]> {
  const result = await db.prepare(sql).bind(...values).all<T>()
  return result.results ?? []
}

export async function dbFirst<T>(db: D1Database, sql: string, ...values: unknown[]): Promise<T | null> {
  return (await db.prepare(sql).bind(...values).first<T>()) ?? null
}

export async function dbRun(db: D1Database, sql: string, ...values: unknown[]): Promise<D1Result> {
  return db.prepare(sql).bind(...values).run()
}

export function placeholders(count: number): string {
  return Array.from({ length: count }, () => '?').join(',')
}
