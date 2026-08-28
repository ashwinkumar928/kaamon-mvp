function Hero() {
  return (
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
  );
}

export default Hero;