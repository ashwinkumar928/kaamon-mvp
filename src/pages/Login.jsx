import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import API_URL from "../api";
import GoogleAuthButton from "../components/GoogleAuthButton";
import "./Auth.css";


function Login() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  async function handleLogin(event) {
    event.preventDefault();

    if (!email || !password) {
      setMessage(
        "Please enter email and password."
      );

      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Invalid email or password."
        );

        return;
      }

      // Keep existing storage names
      // so old login sessions still work
      localStorage.setItem(
        "kaamonToken",
        data.token
      );

      localStorage.setItem(
        "kaamonCurrentUser",
        JSON.stringify(data.user)
      );

      window.dispatchEvent(
        new Event(
          "kaamonAuthChanged"
        )
      );

      navigate("/dashboard");

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setMessage(
        "Could not connect to Karviam server."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="karviam-login-page karviam-auth-page">

      {/* LEFT SIDE */}

      <section className="login-showcase">

        <div className="login-showcase-content">

          <div className="login-showcase-badge">
            KARVIAM MARKETPLACE
          </div>

          <h1>
            Local work.
            <br />

            Real people.
            <br />

            <span>
              One account.
            </span>
          </h1>

          <p className="login-showcase-description">
            Hire trusted people nearby or
            discover short-term work
            opportunities around you.
          </p>


          <div className="login-benefits">

            <div>
              <span>✓</span>
              Hire people nearby
            </div>

            <div>
              <span>✓</span>
              Find local work
            </div>

            <div>
              <span>✓</span>
              Manage everything in one place
            </div>

          </div>

        </div>


        <div className="login-decoration login-decoration-one" />
        <div className="login-decoration login-decoration-two" />

      </section>


      {/* RIGHT SIDE */}

      <section className="login-panel">

        <div className="login-form-container">

          <div className="login-top-row">

            <Link
              to="/"
              className="login-back"
            >
              ← Back to home
            </Link>

            <Link to="/">
              <img
                src="/karviam-logo.png"
                alt="Karviam"
                className="login-logo"
              />
            </Link>

          </div>


          <div className="login-heading">

             <div className="login-greeting">
               Hey <span>👋</span>
            </div>

            <h2>
              Welcome back
            </h2>

            <p>
                Continue hiring, applying and
                managing your Karviam activity.
            </p>

          </div>


          <GoogleAuthButton mode="login" />

          <form
            className="karviam-login-form"
            onSubmit={handleLogin}
          >

            <div className="login-field">

              <label>
                Email address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
              />

            </div>


            <div className="login-field">

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
              />

            </div>

            <div className="forgot-password-row">
            <Link to="/forgot-password">
              Forgot password?
              </Link>
            </div>


            {message && (
              <div className="login-message">
                {message}
              </div>
            )}


            <button
              type="submit"
              className="karviam-login-btn"
              disabled={loading}
            >

              {loading
                ? "Logging in..."
                : (
                  <>
                    Log in
                    <span>→</span>
                  </>
                )}

            </button>

          </form>


          <div className="login-create-account">

            <span>
              Don't have an account?
            </span>

            <Link to="/signup">
              Sign Up →
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}


export default Login;
