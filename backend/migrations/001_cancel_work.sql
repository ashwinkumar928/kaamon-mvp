-- Run manually in Supabase before running the updated backend.
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS cancelled BOOLEAN NOT NULL DEFAULT FALSE;
