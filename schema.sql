PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS blog_contents (
  cid INTEGER PRIMARY KEY AUTOINCREMENT,
  parent INTEGER NOT NULL DEFAULT 0 CHECK (parent >= 0),
  title TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL DEFAULT '',
  created INTEGER NOT NULL,
  modified INTEGER NOT NULL,
  released INTEGER NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  cover TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('post', 'page', 'atta', 'memo')),
  status TEXT NOT NULL CHECK (status IN ('publish', 'draft', 'hidden')) DEFAULT 'draft'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_contents_type_slug
  ON blog_contents(type, slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_public_content_slug
  ON blog_contents(slug)
  WHERE type IN ('post', 'page');
CREATE INDEX IF NOT EXISTS idx_contents_type_status_released
  ON blog_contents(type, status, released DESC);
CREATE INDEX IF NOT EXISTS idx_contents_modified
  ON blog_contents(modified DESC);
CREATE INDEX IF NOT EXISTS idx_contents_type_parent_created
  ON blog_contents(type, parent, created DESC);

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
  "key" TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS blog_sessions (
  cookie TEXT PRIMARY KEY,
  expired INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expired
  ON blog_sessions(expired);

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

CREATE TABLE IF NOT EXISTS blog_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  site TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL,
  created INTEGER NOT NULL,
  cid INTEGER NOT NULL,
  FOREIGN KEY (cid) REFERENCES blog_contents(cid) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_cid_created
  ON blog_comments(cid, created DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_comments_created
  ON blog_comments(created DESC, id DESC);
