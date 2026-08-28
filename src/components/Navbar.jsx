import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <Link to="/" className="logo nav-logo-link">
        Kaam<span>ON</span>
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <a href="/#jobs">Find Work</a>
        <a href="/#how">How It Works</a>
        <a href="/#categories">Categories</a>
      </div>

      <div className="nav-actions">

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

      </div>

    </nav>
  );
}

export default Navbar;