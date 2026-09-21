-- Run manually in the Supabase SQL editor before enabling Google sign-in.
-- If the email index fails, resolve existing normalized-email duplicates first.
-- No accounts are automatically deleted or merged by this migration.
BEGIN;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS google_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_unique ON public.users (google_id);
ALTER TABLE public.users ALTER COLUMN password DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_normalized_email_unique
  ON public.users (lower(btrim(email)));
COMMIT;
