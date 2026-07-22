-- Existing databases only. Fresh databases already include this column in schema.sql.
ALTER TABLE blog_contents ADD COLUMN cover TEXT NOT NULL DEFAULT '';
