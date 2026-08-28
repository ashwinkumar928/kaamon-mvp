import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleLogin(event) {
    event.preventDefault();

    const users =
      JSON.parse(localStorage.getItem("kaamonUsers")) || [];

    const user = users.find(
      (user) =>
        user.email === email &&
        user.password === password
    );

    if (!user) {
      setMessage("Invalid email or password.");
      return;
    }

    const loggedInUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    localStorage.setItem(
      "kaamonCurrentUser",
      JSON.stringify(loggedInUser)
    );

    navigate("/dashboard");
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