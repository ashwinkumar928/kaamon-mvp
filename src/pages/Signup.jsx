import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import "./Auth.css";
import API_URL from "../api";
import GoogleAuthButton from "../components/GoogleAuthButton";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
    });

  const [message, setMessage] =
    useState("");

  const [showOtp, setShowOtp] =
    useState(false);

  const [
    verificationEmail,
    setVerificationEmail,
  ] = useState("");

  const [otp, setOtp] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // ==============================
  // FORM CHANGE
  // ==============================

  function handleChange(event) {
    const { name, value } =
      event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }


  // ==============================
  // CREATE ACCOUNT
  // ==============================

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password
    ) {
      setMessage(
        "Please fill all fields."
      );

      return;
    }

    if (formData.password.length < 6) {
      setMessage(
        "Password must be at least 6 characters."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password:
              formData.password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Could not create account."
        );

        return;
      }

      setVerificationEmail(
        data.email
      );

      setShowOtp(true);

      setMessage(
        "OTP sent to your email."
      );

    } catch (error) {
      console.error(
        "Signup error:",
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
  // VERIFY EMAIL OTP
  // ==============================

  async function handleVerifyOtp(
    event
  ) {
    event.preventDefault();

    setMessage("");

    if (otp.length !== 6) {
      setMessage(
        "Please enter the 6-digit OTP."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/verify-email-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              verificationEmail,
            otp,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Could not verify OTP."
        );

        return;
      }

      navigate("/login");

    } catch (error) {
      console.error(
        "OTP verification error:",
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

      {/* ========================= */}
      {/* LEFT SIDE */}
      {/* ========================= */}

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


      {/* ========================= */}
      {/* RIGHT SIDE */}
      {/* ========================= */}

      <section className="login-panel">

        <div className="login-form-container">

          {/* TOP */}

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


          {!showOtp ? (
            <>

              {/* ================= */}
              {/* SIGNUP HEADING */}
              {/* ================= */}

              <div className="login-heading">

                <div className="login-greeting">
                  Hello{" "}
                  <span>👋</span>
                </div>

                <h2>
                  Create your account
                </h2>

                <p>
                  Hire people, find work
                  and manage everything
                  from one account.
                </p>

              </div>


              {/* ================= */}
              {/* SIGNUP FORM */}
              {/* ================= */}

              <GoogleAuthButton mode="signup" />

              <form
                className="karviam-login-form"
                onSubmit={handleSubmit}
              >

                <div className="login-field">

                  <label>
                    Full name
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                <div className="login-field">

                  <label>
                    Email address
                  </label>

                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                <div className="login-field">

                  <label>
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
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
                    ? "Creating account..."
                    : (
                      <>
                        Create Account
                        <span>→</span>
                      </>
                    )}

                </button>

              </form>


              <div className="login-create-account">

                <span>
                  Already have an account?
                </span>

                <Link to="/login">
                  Login →
                </Link>

              </div>

            </>

          ) : (

            <>

              {/* ================= */}
              {/* OTP HEADING */}
              {/* ================= */}

              <div className="login-heading">

                <div className="login-greeting">
                  Almost there{" "}
                  <span>✨</span>
                </div>

                <h2>
                  Verify your email
                </h2>

                <p>
                  Enter the 6-digit code
                  sent to{" "}
                  <strong>
                    {verificationEmail}
                  </strong>
                </p>

              </div>


              {/* ================= */}
              {/* OTP FORM */}
              {/* ================= */}

              <form
                className="karviam-login-form"
                onSubmit={
                  handleVerifyOtp
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
                    value={otp}
                    maxLength={6}
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
                    ? "Verifying..."
                    : (
                      <>
                        Verify Email
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

export default Signup;
