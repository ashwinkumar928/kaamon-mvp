const { createClient } = require("@supabase/supabase-js");

let client;
function getPhotoBucket() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Profile storage is not configured");
  }
  client ||= createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client.storage.from("profile-pictures");
}

module.exports = { getPhotoBucket };
