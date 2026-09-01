import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    if (!email || !password) {
      setMessage("Please enter email and password.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Invalid email or password."
        );
        return;
      }

      localStorage.setItem(
        "kaamonToken",
        data.token
      );

      localStorage.setItem(
        "kaamonCurrentUser",
        JSON.stringify(data.user)
      );

      window.dispatchEvent(
  new Event("kaamonAuthChanged")
);

      setMessage("");

      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        "Could not connect to KaamON server."
      );
    }
  }

  return (
    <main className="auth-page">

      <div className="auth-card">

        <div className="auth-brand">
          Kaam<span>ON</span>
        </div>

        <h1>Welcome back</h1>

        <p className="auth-subtitle">
          Login to continue with KaamON.
        </p>

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />

          {message && (
            <p className="auth-message">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="auth-main-btn"
          >
            Login
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/signup">
            Sign Up
          </Link>
        </p>

      </div>

    </main>
  );
}

export default Login;