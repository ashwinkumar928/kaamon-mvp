import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

let scriptPromise;
function loadGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      const timeout = window.setTimeout(fail, 15000);
      function fail() {
        window.clearTimeout(timeout);
        script.remove();
        scriptPromise = undefined;
        reject(new Error("Google unavailable"));
      }
      script.onload = () => {
        window.clearTimeout(timeout);
        if (window.google?.accounts?.id) resolve(window.google.accounts.id);
        else fail();
      };
      script.onerror = fail;
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export default function GoogleAuthButton({ mode = "login" }) {
  const container = useRef(null);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  useEffect(() => {
    if (!clientId) return;
    let active = true;
    let submitting = false;
    let observer;
    let controller;
    const element = container.current;

    async function handleCredential(response) {
      if (!active || submitting) return;
      if (!response?.credential) {
        setMessage("Google sign-in was not completed. Please try again.");
        return;
      }
      submitting = true;
      setLoading(true);
      setMessage("");
      controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20000);
      try {
        const result = await fetch(`${API_URL}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
          signal: controller.signal,
        });
        if (!active) return;
        if (!result.ok) {
          setMessage(result.status === 401
            ? "Google could not verify your account. Please try again."
            : result.status === 409
              ? "Please use your existing sign-in method for this account."
              : "Google sign-in is unavailable right now. Please try again later.");
          return;
        }
        const data = await result.json();
        if (!active) return;
        if (typeof data.token !== "string" || !data.token || !data.user?.id || !data.user?.email) {
          throw new Error("Invalid session");
        }
        localStorage.setItem("kaamonCurrentUser", JSON.stringify(data.user));
        localStorage.setItem("kaamonToken", data.token);
        window.dispatchEvent(new Event("kaamonAuthChanged"));
        navigate("/dashboard");
      } catch {
        if (active) setMessage("Could not complete Google sign-in. Check your connection and try again.");
      } finally {
        window.clearTimeout(timeout);
        submitting = false;
        if (active) setLoading(false);
      }
    }

    loadGoogle().then((googleId) => {
      if (!active) return;
      googleId.initialize({
        client_id: clientId,
        callback: handleCredential,
        ux_mode: "popup",
        auto_select: false,
      });
      let previousWidth;
      function render() {
        const width = Math.min(400, Math.floor(element.getBoundingClientRect().width));
        if (!active || width < 1 || width === previousWidth) return;
        previousWidth = width;
        element.replaceChildren();
        googleId.renderButton(element, {
          type: "standard", theme: "outline", size: "large",
          text: "continue_with", shape: "rectangular", width,
          click_listener: () => {
            if (active) setMessage("If you close the Google window, select Continue with Google to try again.");
          },
        });
      }
      render();
      observer = new ResizeObserver(render);
      observer.observe(element);
      setReady(true);
    }).catch(() => {
      if (active) setMessage("Could not load Google sign-in. Refresh to retry or use email below.");
    });

    return () => {
      active = false;
      observer?.disconnect();
      controller?.abort();
      element.replaceChildren();
    };
  }, [clientId, navigate]);

  return (
    <div className="google-auth">
      <div className="google-auth-button" ref={container} inert={loading} aria-busy={loading} />
      <div className="google-auth-status" role="status" aria-live="polite">
        {!clientId ? "Google sign-in is unavailable. Please use email below."
          : loading ? "Signing in with Google..."
            : message || (!ready ? "Loading Google sign-in..." : "")}
      </div>
      <div className="auth-divider">
        <span>{mode === "signup" ? "or create account with email" : "or continue with email"}</span>
      </div>
    </div>
  );
}
