const multer = require("multer");
const { randomUUID } = require("node:crypto");
const { getPhotoBucket } = require("./storage");

const INVALID_PHOTO = "Please upload a JPG, PNG or WebP image under 3 MB.";
const MAX_SIZE = 3 * 1024 * 1024;
const types = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 1, fields: 0, parts: 1 },
  fileFilter: (_req, file, done) => done(null, Object.hasOwn(types, file.mimetype)),
}).single("photo");

function validPhoto(file) {
  if (!file || !Object.hasOwn(types, file.mimetype) || !file.size || file.size > MAX_SIZE) return false;
  const b = file.buffer;
  if (file.mimetype === "image/jpeg") return b.length >= 4 && b[0] === 255 && b[1] === 216 && b[2] === 255;
  if (file.mimetype === "image/png") return b.length >= 24 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && b.toString("ascii", 12, 16) === "IHDR";
  return b.length >= 16 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" && ["VP8 ", "VP8L", "VP8X"].includes(b.toString("ascii", 12, 16));
}

function ownedPath(path, id) {
  return typeof path === "string" && path.startsWith(`users/${id}/`) &&
    !path.includes("..") && path.split("/").length === 3;
}

function registerPhotoRoutes(app, authenticateToken, pool, bucketProvider = getPhotoBucket) {
  async function changePhoto(req, res, remove) {
    let client;
    let bucket;
    let newPath;
    let committed = false;
    try {
      const id = String(req.user.id);
      if (!/^[a-zA-Z0-9-]+$/.test(id)) return res.status(401).json({ message: "Please login first." });
      client = await pool.connect();
      await client.query("BEGIN");
      // Row locking also protects simultaneous changes across backend instances.
      const result = await client.query("SELECT profile_picture_path FROM users WHERE id = $1 FOR UPDATE", [id]);
      if (!result.rows.length) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "User not found." });
      }
      const oldPath = result.rows[0].profile_picture_path;
      let url = null;
      if (!remove) {
        bucket = bucketProvider();
        newPath = `users/${id}/avatar-${randomUUID()}.${types[req.file.mimetype]}`;
        const uploaded = await bucket.upload(newPath, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
        if (uploaded.error) throw new Error("Upload failed");
        url = bucket.getPublicUrl(newPath).data.publicUrl;
      }
      if (remove && ownedPath(oldPath, id)) {
        bucket = bucketProvider();
        const deleted = await bucket.remove([oldPath]);
        if (deleted.error) throw new Error("Removal failed");
      }
      await client.query("UPDATE users SET profile_picture_url = $1, profile_picture_path = $2 WHERE id = $3", [url, newPath || null, id]);
      await client.query("COMMIT");
      committed = true;
      if (!remove && ownedPath(oldPath, id)) {
        try {
          bucket ||= bucketProvider();
          const deleted = await bucket.remove([oldPath]);
          if (deleted.error) throw new Error("Cleanup failed");
        } catch {
          console.warn("Profile photo storage cleanup failed; unreferenced object may require cleanup.");
        }
      }
      return res.json({ message: remove ? "Profile photo removed." : "Profile photo updated.", profile_picture_url: url });
    } catch {
      if (client && !committed) await client.query("ROLLBACK").catch(() => {});
      if (bucket && newPath && !committed) await bucket.remove([newPath]).catch(() => {});
      return res.status(500).json({ message: "Couldn't update profile photo. Please try again." });
    } finally {
      client?.release();
    }
  }
  app.post("/api/profile/photo", authenticateToken, (req, res) => {
    upload(req, res, (error) => {
      if (error || !validPhoto(req.file)) return res.status(400).json({ message: INVALID_PHOTO });
      return changePhoto(req, res, false);
    });
  });
  app.delete("/api/profile/photo", authenticateToken, (req, res) => changePhoto(req, res, true));
}

module.exports = { registerPhotoRoutes, validPhoto, ownedPath };
