function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        Kaam<span>ON</span>
      </div>

      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#jobs">Find Work</a>
        <a href="#how">How It Works</a>
        <a href="#categories">Categories</a>
      </div>

      <div className="nav-actions">
        <button className="login-btn">Login</button>
        <button className="signup-btn">Sign Up</button>
      </div>
    </nav>
  );
}

export default Navbar;