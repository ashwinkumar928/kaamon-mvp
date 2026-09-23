-- Run manually before using the profile-photo feature. Existing values remain NULL.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_picture_path TEXT;
