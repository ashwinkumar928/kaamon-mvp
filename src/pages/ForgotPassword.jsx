import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import API_URL from "../api";
import "./Auth.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [otpSent, setOtpSent] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // ==============================
  // SEND RESET OTP
  // ==============================

  async function handleSendOtp(event) {
    event.preventDefault();

    setMessage("");

    if (!email) {
      setMessage(
        "Please enter your email address."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Could not send reset code."
        );

        return;
      }

      setOtpSent(true);

      setMessage(
        "Verification code sent to your email."
      );

    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      setMessage(
        "Could not connect to Karviam server."
      );

    } finally {
      setLoading(false);
    }
  }


  // ==============================
  // RESET PASSWORD
  // ==============================

  async function handleResetPassword(
    event
  ) {
    event.preventDefault();

    setMessage("");

    if (otp.length !== 6) {
      setMessage(
        "Please enter the 6-digit verification code."
      );

      return;
    }

    if (newPassword.length < 6) {
      setMessage(
        "Password must be at least 6 characters."
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setMessage(
        "Passwords do not match."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            otp,
            newPassword,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Could not reset password."
        );

        return;
      }

      alert(
        "Password reset successfully."
      );

      navigate("/login");

    } catch (error) {
      console.error(
        "Reset password error:",
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
    <main className="karviam-login-page">

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
            Hire trusted people nearby
            or discover short-term work
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

        <div
          className="
            login-decoration
            login-decoration-one
          "
        />

        <div
          className="
            login-decoration
            login-decoration-two
          "
        />

      </section>


      {/* RIGHT SIDE */}

      <section className="login-panel">

        <div className="login-form-container">

          <div className="login-top-row">

            <Link
              to="/login"
              className="login-back"
            >
              ← Back to login
            </Link>

            <Link to="/">
              <img
                src="/karviam-logo.png"
                alt="Karviam"
                className="login-logo"
              />
            </Link>

          </div>


          {!otpSent ? (
            <>

              <div className="login-heading">

                <div className="login-greeting">
                  Forgot password?{" "}
                  <span>🔐</span>
                </div>

                <h2>
                  Reset your password
                </h2>

                <p>
                  Enter the email connected
                  to your Karviam account.
                </p>

              </div>


              <form
                className="karviam-login-form"
                onSubmit={handleSendOtp}
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
                    ? "Sending code..."
                    : (
                      <>
                        Send Verification Code
                        <span>→</span>
                      </>
                    )}

                </button>

              </form>

            </>
          ) : (
            <>

              <div className="login-heading">

                <div className="login-greeting">
                  Almost there{" "}
                  <span>✨</span>
                </div>

                <h2>
                  Create a new password
                </h2>

                <p>
                  Enter the code sent to{" "}
                  <strong>
                    {email}
                  </strong>
                </p>

              </div>


              <form
                className="karviam-login-form"
                onSubmit={
                  handleResetPassword
                }
              >

                <div className="login-field">

                  <label>
                    Verification code
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    value={otp}
                    onChange={(event) => {
                      const value =
                        event.target.value.replace(
                          /\D/g,
                          ""
                        );

                      setOtp(value);
                    }}
                  />

                </div>


                <div className="login-field">

                  <label>
                    New password
                  </label>

                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                  />

                </div>


                <div className="login-field">

                  <label>
                    Confirm new password
                  </label>

                  <input
                    type="password"
                    placeholder="Enter password again"
                    value={
                      confirmPassword
                    }
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                  />

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
                    ? "Resetting..."
                    : (
                      <>
                        Reset Password
                        <span>→</span>
                      </>
                    )}

                </button>

              </form>

            </>
          )}

        </div>

      </section>

    </main>
  );
}

export default ForgotPassword;