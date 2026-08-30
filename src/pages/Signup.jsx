import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import API_URL from "../api";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

    async function handleSubmit(event) {
  event.preventDefault();

  if (
    !formData.name ||
    !formData.email ||
    !formData.password
  ) {
    setMessage("Please fill all fields.");
    return;
  }

  if (formData.password.length < 6) {
    setMessage(
      "Password must be at least 6 characters."
    );
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/api/auth/register`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data.message || "Could not create account."
      );
      return;
    }

    setMessage("");

    navigate("/login");

  } catch (error) {
    console.error("Signup error:", error);

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

        <h1>Create your account</h1>

        <p className="auth-subtitle">
          One account to hire people and find work.
        </p>

        <form onSubmit={handleSubmit}>

          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={handleChange}
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
            Create Account
          </button>

        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>

    </main>
  );
}

export default Signup;