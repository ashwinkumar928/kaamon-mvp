-- Run manually in Supabase SQL Editor before starting the updated backend.
BEGIN;
CREATE TABLE reports (
  id BIGSERIAL PRIMARY KEY,
  reporter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('user', 'job')),
  reported_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  reported_job_id BIGINT REFERENCES jobs(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT CHECK (char_length(details) <= 500),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((report_type = 'user' AND reported_user_id IS NOT NULL AND reported_job_id IS NULL)
      OR (report_type = 'job' AND reported_job_id IS NOT NULL AND reported_user_id IS NULL)),
  CHECK (reported_user_id IS NULL OR reporter_id <> reported_user_id),
  CHECK ((report_type = 'user' AND reason IN ('suspicious_account', 'harassment', 'inappropriate_behavior', 'misleading_profile', 'unsafe_behavior', 'other'))
      OR (report_type = 'job' AND reason IN ('fake_or_spam', 'misleading_details', 'misleading_payment', 'unsafe_work', 'inappropriate_content', 'other')))
);
CREATE INDEX reports_reporter_idx ON reports(reporter_id);
CREATE INDEX reports_status_created_idx ON reports(status, created_at DESC);
CREATE UNIQUE INDEX reports_unique_user_report ON reports(reporter_id, reported_user_id) WHERE report_type = 'user';
CREATE UNIQUE INDEX reports_unique_job_report ON reports(reporter_id, reported_job_id) WHERE report_type = 'job';

CREATE TABLE user_blocks (
  id BIGSERIAL PRIMARY KEY,
  blocker_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (blocker_id, blocked_user_id),
  CHECK (blocker_id <> blocked_user_id)
);
CREATE INDEX user_blocks_blocker_idx ON user_blocks(blocker_id);
CREATE INDEX user_blocks_blocked_idx ON user_blocks(blocked_user_id);

-- Custom JWT authorization lives in Express. No direct browser access to safety data.
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON reports, user_blocks FROM anon, authenticated;
REVOKE ALL ON SEQUENCE reports_id_seq, user_blocks_id_seq FROM anon, authenticated;
-- The existing backend database role must own these tables or have BYPASSRLS.
COMMIT;
