PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS blog_contents (
  cid INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL DEFAULT '',
  created INTEGER NOT NULL,
  modified INTEGER NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('post', 'page', 'attachment', 'memo')),
  status TEXT NOT NULL CHECK (status IN ('publish', 'draft', 'hidden')) DEFAULT 'draft'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_contents_type_slug
  ON blog_contents(type, slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_public_content_slug
  ON blog_contents(slug)
  WHERE type IN ('post', 'page');
CREATE INDEX IF NOT EXISTS idx_contents_type_status_created
  ON blog_contents(type, status, created DESC);

CREATE TABLE IF NOT EXISTS blog_metas (
  mid INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tag', 'category')),
  description TEXT NOT NULL DEFAULT '',
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(type, slug)
);

CREATE INDEX IF NOT EXISTS idx_metas_type_name
  ON blog_metas(type, name);

CREATE TABLE IF NOT EXISTS blog_relationships (
  cid INTEGER NOT NULL,
  mid INTEGER NOT NULL,
  PRIMARY KEY (cid, mid),
  FOREIGN KEY (cid) REFERENCES blog_contents(cid) ON DELETE CASCADE,
  FOREIGN KEY (mid) REFERENCES blog_metas(mid) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_relationships_mid
  ON blog_relationships(mid, cid);

CREATE TRIGGER IF NOT EXISTS trg_relationship_insert_count
AFTER INSERT ON blog_relationships
BEGIN
  UPDATE blog_metas SET count = count + 1 WHERE mid = NEW.mid;
END;

CREATE TRIGGER IF NOT EXISTS trg_relationship_delete_count
AFTER DELETE ON blog_relationships
BEGIN
  UPDATE blog_metas SET count = MAX(count - 1, 0) WHERE mid = OLD.mid;
END;

CREATE TABLE IF NOT EXISTS blog_options (
  name TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS blog_cookies (
  cookie TEXT PRIMARY KEY,
  expired INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cookies_expired
  ON blog_cookies(expired);

CREATE TABLE IF NOT EXISTS blog_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '',
  info TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_links_order
  ON blog_links("order" DESC, id DESC);
