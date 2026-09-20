import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();


  const [currentUser, setCurrentUser] =
    useState(() => {
      const savedUser =
        localStorage.getItem(
          "kaamonCurrentUser"
        );

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    });


  useEffect(() => {
    function updateLoggedInUser() {
      const savedUser =
        localStorage.getItem(
          "kaamonCurrentUser"
        );

      if (savedUser) {
        setCurrentUser(
          JSON.parse(savedUser)
        );
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
    localStorage.removeItem(
      "kaamonToken"
    );

    localStorage.removeItem(
      "kaamonCurrentUser"
    );

    setCurrentUser(null);

    window.dispatchEvent(
      new Event(
        "kaamonAuthChanged"
      )
    );

    navigate("/");
  }


  return (
    <nav className="navbar">

      <Link
        to="/"
        className="nav-logo-link"
      >
        <img
          src="/karviam-logo.png"
          alt="Karviam"
          className="karviam-navbar-logo"
        />
      </Link>


      <div className="nav-links">

        <Link to="/">
          Home
          <span className="nav-hover-arrow" aria-hidden="true"></span>
        </Link>

        <a href="/#jobs">
          Find Work
          <span className="nav-hover-arrow" aria-hidden="true"></span>
        </a>

        <a href="/#how">
          How It Works
          <span className="nav-hover-arrow" aria-hidden="true"></span>
        </a>

        <a href="/#categories">
          Categories
          <span className="nav-hover-arrow" aria-hidden="true"></span>
        </a>


        {currentUser && (
          <>
            <Link to="/dashboard">
              Dashboard
              <span className="nav-hover-arrow" aria-hidden="true"></span>
            </Link>

            <Link to="/my-jobs">
              My Posted Jobs
              <span className="nav-hover-arrow" aria-hidden="true"></span>
            </Link>
          </>
        )}

      </div>


      <div className="nav-actions">

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