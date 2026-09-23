import { useState } from "react";
import "./UserAvatar.css";

export default function UserAvatar({ name = "", src, size = 32, className = "" }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = (words.length > 1 ? words[0][0] + words.at(-1)[0] : words[0]?.[0] || "U").toUpperCase();
  return (
    <span className={`user-avatar ${className}`} style={{ width: size, height: size, fontSize: size * 0.34 }} role="img" aria-label={`${name || "User"} profile photo`}>
      {src && src !== failedSrc ? <img key={src} src={src} alt="" referrerPolicy="no-referrer" onError={() => setFailedSrc(src)} /> : initials}
    </span>
  );
}
