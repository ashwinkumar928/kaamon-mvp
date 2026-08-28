import "./App.css";

function App() {
  return (
    <div className="app">

      {/* NAVBAR */}
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


      {/* HERO */}
      <section className="hero" id="home">

        <div className="hero-left">

          <div className="badge">
            ⚡ Local work, when you need it
          </div>

          <h1>
            Kaam Do.<br />
            Kaam Lo. <span>Kamao.</span>
          </h1>

          <p className="hero-description">
            Find trusted people nearby for your work or discover
            short-term earning opportunities around you.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">
              👤 I Need Someone
            </button>

            <button className="secondary-btn">
              💼 I Want to Work
            </button>
          </div>

          <div className="one-account">
            <span>✓</span>
            One account for hiring and working
          </div>


          <div className="quick-categories">
            <p>Popular:</p>

            <span>🚗 Driver</span>
            <span>🎨 Painter</span>
            <span>🍳 Cook</span>
            <span>🔧 Plumber</span>
          </div>

        </div>


        {/* RIGHT SIDE */}
        <div className="hero-right">

          <div className="background-circle circle-one"></div>
          <div className="background-circle circle-two"></div>

          <div className="job-card main-card">

            <div className="card-top">
              <div className="job-icon">🚗</div>

              <div>
                <p className="job-label">NEW WORK NEARBY</p>
                <h3>Driver Needed</h3>
              </div>

              <span className="distance">2.4 km</span>
            </div>

            <div className="job-info">
              <div>
                <span>📍</span>
                <p>Patna</p>
              </div>

              <div>
                <span>🕘</span>
                <p>9 AM – 6 PM</p>
              </div>

              <div>
                <span>💰</span>
                <p>₹1,000</p>
              </div>
            </div>

            <button className="apply-btn">
              View Work →
            </button>

          </div>


          <div className="small-card worker-card">
            <div className="worker-avatar">RK</div>

            <div>
              <strong>Rahul Kumar</strong>
              <p>⭐ 4.8 • Driver</p>
              <span>✓ Verified</span>
            </div>
          </div>


          <div className="small-card opportunity-card">
            <span className="green-dot"></span>

            <div>
              <strong>12 jobs nearby</strong>
              <p>Available today</p>
            </div>
          </div>

        </div>

      </section>

    {/* STATS */}
<section className="stats">

  <div>
    <strong>Local</strong>
    <span>Nearby opportunities</span>
  </div>

  <div>
    <strong>Flexible</strong>
    <span>Hourly & daily work</span>
  </div>

  <div>
    <strong>Two-Way</strong>
    <span>Hire & work</span>
  </div>

  <div>
    <strong>Trusted</strong>
    <span>Profiles & reviews</span>
  </div>

</section>


{/* CATEGORIES SECTION */}
<section className="categories-section" id="categories">

  <div className="section-title">
    <span>EXPLORE KAAMON</span>

    <h2>Find What You Need</h2>

    <p>
      Explore popular local work categories around you.
    </p>
  </div>


  <div className="categories-grid">

    <div className="category-box">
      <div className="category-emoji">🚗</div>
      <h3>Driver</h3>
      <p>Daily & short-term driving work</p>
    </div>


    <div className="category-box">
      <div className="category-emoji">🎨</div>
      <h3>Painter</h3>
      <p>Home and shop painting work</p>
    </div>


    <div className="category-box">
      <div className="category-emoji">🍳</div>
      <h3>Cook</h3>
      <p>Home and event cooking</p>
    </div>


    <div className="category-box">
      <div className="category-emoji">🧹</div>
      <h3>Cleaner</h3>
      <p>Cleaning work nearby</p>
    </div>


    <div className="category-box">
      <div className="category-emoji">⚡</div>
      <h3>Electrician</h3>
      <p>Electrical repair & installation</p>
    </div>


    <div className="category-box">
      <div className="category-emoji">🔧</div>
      <h3>Plumber</h3>
      <p>Plumbing and repair work</p>
    </div>


    <div className="category-box">
      <div className="category-emoji">🏪</div>
      <h3>Shop Helper</h3>
      <p>Temporary shop assistance</p>
    </div>


    <div className="category-box">
      <div className="category-emoji">🍽️</div>
      <h3>Restaurant Helper</h3>
      <p>Restaurant & event assistance</p>
    </div>

  </div>

</section>

{/* NEARBY JOBS SECTION */}
<section className="nearby-jobs" id="jobs">

  <div className="section-title">
    <span>WORK NEAR YOU</span>
    <h2>Nearby Opportunities</h2>
    <p>
      Discover short-term work opportunities available around you.
    </p>
  </div>

  <div className="jobs-grid">

    {/* JOB 1 */}
    <div className="nearby-job-card">

      <div className="nearby-job-top">
        <div className="nearby-job-icon">🚗</div>

        <div>
          <span className="job-type">DRIVER</span>
          <h3>Driver Needed for One Day</h3>
        </div>
      </div>

      <p className="nearby-job-description">
        Need an experienced driver for local travel during the day.
      </p>

      <div className="job-details-row">
        <span>📍 Patna</span>
        <span>📅 Tomorrow</span>
      </div>

      <div className="job-details-row">
        <span>🕘 9 AM – 6 PM</span>
        <span>📏 2.4 km away</span>
      </div>

      <div className="job-bottom">
        <strong>₹1,000</strong>
        <button>View Work →</button>
      </div>

    </div>


    {/* JOB 2 */}
    <div className="nearby-job-card">

      <div className="nearby-job-top">
        <div className="nearby-job-icon">🏪</div>

        <div>
          <span className="job-type">SHOP HELPER</span>
          <h3>Helper Needed at Store</h3>
        </div>
      </div>

      <p className="nearby-job-description">
        Need someone to help with customers and arranging products.
      </p>

      <div className="job-details-row">
        <span>📍 Danapur</span>
        <span>📅 Today</span>
      </div>

      <div className="job-details-row">
        <span>🕘 10 AM – 7 PM</span>
        <span>📏 3.1 km away</span>
      </div>

      <div className="job-bottom">
        <strong>₹700</strong>
        <button>View Work →</button>
      </div>

    </div>


    {/* JOB 3 */}
    <div className="nearby-job-card">

      <div className="nearby-job-top">
        <div className="nearby-job-icon">🎨</div>

        <div>
          <span className="job-type">PAINTER</span>
          <h3>Painter Required</h3>
        </div>
      </div>

      <p className="nearby-job-description">
        Painter required for painting one room at a residential house.
      </p>

      <div className="job-details-row">
        <span>📍 Patna</span>
        <span>📅 Saturday</span>
      </div>

      <div className="job-details-row">
        <span>🕘 Full Day</span>
        <span>📏 4.5 km away</span>
      </div>

      <div className="job-bottom">
        <strong>₹1,200</strong>
        <button>View Work →</button>
      </div>

    </div>

  </div>

  <div className="view-all-jobs">
    <button>View All Work Opportunities →</button>
  </div>

</section>

</div>
);
}

export default App;