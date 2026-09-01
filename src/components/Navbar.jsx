import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("kaamonTheme") === "dark";
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser =
      localStorage.getItem("kaamonCurrentUser");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });


  useEffect(() => {
    document.body.classList.toggle(
      "dark-mode",
      darkMode
    );

    localStorage.setItem(
      "kaamonTheme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  useEffect(() => {
  function updateLoggedInUser() {
    const savedUser =
      localStorage.getItem("kaamonCurrentUser");

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      setCurrentUser(null);
    }
  }

  window.addEventListener(
    "kaamonAuthChanged",
    updateLoggedInUser
  );

  return () => {
    window.removeEventListener(
      "kaamonAuthChanged",
      updateLoggedInUser
    );
  };
}, []);

function handleLogout() {
  localStorage.removeItem("kaamonToken");
  localStorage.removeItem("kaamonCurrentUser");

  setCurrentUser(null);

  window.dispatchEvent(
    new Event("kaamonAuthChanged")
  );

  navigate("/");
}


  return (
    <nav className="navbar">

      <Link
        to="/"
        className="logo nav-logo-link"
      >
        Kaam<span>ON</span>
      </Link>


      <div className="nav-links">
        <Link to="/">Home</Link>
        <a href="/#jobs">Find Work</a>
        <a href="/#how">How It Works</a>
        <a href="/#categories">Categories</a>
      </div>


      <div className="nav-actions">

        <button
          type="button"
          className="theme-toggle"
          onClick={() =>
            setDarkMode((current) => !current)
          }
        >
          {darkMode ? "☀️" : "🌙"}
        </button>


        {!currentUser ? (
          <>
            <Link
              to="/login"
              className="login-btn nav-button-link"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="signup-btn nav-button-link"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/profile"
              className="logged-user"
            >
              👤 {currentUser.name}
            </Link>

            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;