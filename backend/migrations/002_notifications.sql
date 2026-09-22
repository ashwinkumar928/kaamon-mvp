-- Run manually in the Supabase SQL editor before using notifications.
CREATE TABLE public.notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_user_created_idx
  ON public.notifications(user_id, created_at DESC, id DESC);

CREATE INDEX notifications_user_unread_idx
  ON public.notifications(user_id) WHERE NOT is_read;

-- JWT authorization lives in Express. Block direct access through Supabase's
-- public API; the existing trusted backend connection accesses this table.
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.notifications FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.notifications_id_seq FROM anon, authenticated;
