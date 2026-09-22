import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import categories from "../data/categories";
import NearbyJobs from "../components/NearbyJobs";
import "./Home.css";
import { nearestSupportedArea, supportedAreas } from "../data/supportedAreas";

function Home() {
  const [area, setArea] = useState("Patna");
  const [workSearch, setWorkSearch] = useState("");
  const [workCategory, setWorkCategory] = useState("ALL");
  const [jobFilters, setJobFilters] = useState({ location: "", search: "", category: "ALL" });
  const [locationMessage, setLocationMessage] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationDetail, setLocationDetail] = useState("");
  const requestId = useRef(0);
  const pending = useRef(false);
  useEffect(() => () => { requestId.current += 1; }, []);

  function changeArea(value) {
    requestId.current += 1;
    pending.current = false;
    setLocating(false);
    setArea(value);
    setLocationMessage("");
    setLocationDetail("");
    setJobFilters((current) => ({ ...current, location: value }));
  }

  function findNearbyWork(event) {
    event.preventDefault();
    setJobFilters({ location: area, search: workSearch.trim(), category: workCategory });
    document.getElementById("jobs")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      block: "start",
    });
  }

  function useMyLocation() {
    if (pending.current) return;
    const request = ++requestId.current;
    const fail = (error) => {
      if (request !== requestId.current) return;
      pending.current = false;
      setLocating(false);
      setLocationMessage("Choose your area manually");
      setLocationDetail(error?.code === 1
        ? "Location access was not allowed. Choose your area manually."
        : "Couldn’t detect your location. Choose your area manually.");
    };
    if (!navigator.geolocation) {
      fail();
      return;
    }
    pending.current = true;
    setLocating(true);
    setLocationMessage("Finding your location…");
    setLocationDetail("");
    try {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (request !== requestId.current) return;
        pending.current = false;
        setLocating(false);
        const nearest = nearestSupportedArea(coords.latitude, coords.longitude);
        if (!nearest) {
          setLocationMessage("Area not supported yet");
          setLocationDetail("Karviam isn’t available in your area yet. Choose another area to explore available work.");
          return;
        }
        setArea(nearest.name);
        setJobFilters((current) => ({ ...current, location: nearest.name }));
        setLocationMessage(`Location detected • ${nearest.name}`);
      },
      fail,
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false }
    );
    } catch { fail(); }
  }

  const currentUser = JSON.parse(
    localStorage.getItem("kaamonCurrentUser")
  );

  const workerCards = [
    {
      id: 1,
      image: "/demo-workers/ashwin.png",
      name: "Ashwin",
      role: "Driver",
      location: "Patna",
      tag: "Available Today",
      className: "worker-green",
    },
    {
      id: 2,
      image: "/demo-workers/usha-devi.png",
      name: "Usha Devi",
      role: "Cook",
      location: "phulwari",
      tag: "Near You",
      className: "worker-orange",
    },
    {
      id: 3,
      image: "/demo-workers/himanshu.png",
      name: "Himanshu",
      role: "Electrician",
      location: "Danapur",
      tag: "Starting Now",
      className: "worker-blue",
    },
  ];

  return (
    <main className="karviam-home">

      <section className="home-local-discovery" aria-labelledby="local-discovery-heading">
        <div className="home-local-scene">
          <div className="home-local-heading">
            <span>NEARBY OPPORTUNITIES</span>
            <h1 id="local-discovery-heading">Find work<br /><em>near you.</em></h1>
            <p>Discover short-term work around Patna and nearby areas.</p>
          </div>

          <form className="home-local-panel" onSubmit={findNearbyWork}>
            <div className="home-local-controls">
              <div className="home-local-area">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
                <div>
                  <select id="local-area" aria-label="Your area" value={area} onChange={(event) => changeArea(event.target.value)}>
                    {supportedAreas.map(({ name: city }) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="home-local-search">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7.5" /><path d="m16 16 5 5" /></svg>
                <input
                  type="search"
                  aria-label="Work you are looking for"
                  placeholder="What work are you looking for?"
                  value={workSearch}
                  onChange={(event) => {
                    setWorkSearch(event.target.value);
                    setWorkCategory("ALL");
                    setJobFilters((current) => ({ ...current, search: event.target.value.trim(), category: "ALL" }));
                  }}
                />
              </div>
              <button
                className="home-local-geolocation"
                type="button"
                title="Use my location"
                aria-label={locating ? "Finding your location" : "Use my location"}
                onClick={useMyLocation}
                disabled={locating}
                aria-busy={locating}
                aria-describedby="local-location-status"
              >
                {locating ? <span className="home-location-spinner" aria-hidden="true" /> : <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M12 2v5M12 17v5M2 12h5M17 12h5" /></svg>}
              </button>
              <button className="home-local-submit" type="submit" title="Find opportunities near me" aria-label="Find opportunities near me">
                Search <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
          <div className="home-local-location-status" id="local-location-status" role="status" aria-atomic="true">
            <span className="home-location-pill">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
              {locationMessage || `Searching around ${area}`}
            </span>
            {locationDetail && <details className="home-location-detail"><summary>Location details</summary><p>{locationDetail}</p></details>}
          </div>

          <div className="home-local-categories" role="group" aria-label="Choose a work category">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={workCategory === category.name.toUpperCase()}
                onClick={() => {
                  const isSelected = workCategory === category.name.toUpperCase();
                  setWorkCategory(isSelected ? "ALL" : category.name.toUpperCase());
                  setWorkSearch(isSelected ? "" : category.name);
                  setJobFilters((current) => ({ ...current, search: isSelected ? "" : category.name, category: isSelected ? "ALL" : category.name.toUpperCase() }));
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>



      <section className="home-jobs-wrapper">

        <NearbyJobs filters={jobFilters} onFiltersChange={setJobFilters} />

      </section>

      {/* ===================================
          HERO
      =================================== */}

      <section className="home-hero">

        <div className="home-hero-content">

          <div className="home-hero-badge">
            <span>●</span>
            LOCAL WORK. REAL PEOPLE.
          </div>

          <h2>
            Hire nearby help.
            <br />

            <span>
              Find local work.
            </span>

            <br />

            One account for both.
          </h2>

          <p className="home-hero-description">
            Karviam connects people who need
            short-term help with nearby people
            ready to work — simply, locally and
            from one account.
          </p>


          <div className="home-hero-actions">

            <a
              href="#jobs"
              className="home-primary-btn"
            >
              Find Work
              <span>→</span>
            </a>

            <Link
              to={
                currentUser
                  ? "/post-work"
                  : "/login"
              }
              className="home-secondary-btn"
            >
              Post Work
            </Link>

          </div>


          <div className="home-trust-row">

            <div>
              <span>✓</span>
              One account
            </div>

            <div>
              <span>✓</span>
              Nearby opportunities
            </div>

            <div>
              <span>✓</span>
              Direct connection
            </div>

          </div>

        </div>


        {/* HERO VISUAL */}

        <div className="home-worker-showcase">

          <div className="home-showcase-glow" />

          <div className="showcase-heading">

            <span>
              PEOPLE NEAR YOU
            </span>

            <p>
              Find skilled people and
              opportunities around your city.
            </p>

          </div>


          <div className="worker-card-stack">

            {workerCards.map(
              (worker, index) => (
                <article
                  className={`home-worker-card ${worker.className}`}
                  key={worker.id}
                  style={{
                    "--card-index": index,
                  }}
                >

                  <img
                    className="worker-photo"
                    src={worker.image}
                    alt={`${worker.name}, demo ${worker.role.toLowerCase()} profile`}
                    width="1122"
                    height="1402"
                    decoding="async"
                  />


                  <div className="worker-card-info">

                    <h3>
                      {worker.name}
                    </h3>

                    <p>
                      {worker.role}
                      <span>•</span>
                      {worker.location}
                    </p>

                  </div>


                  <div className="worker-card-bottom">

                    <span>
                      DEMO PROFILE
                    </span>

                    <div className="worker-status">
                      {worker.tag}
                    </div>

                  </div>

                </article>
              )
            )}

          </div>

        </div>

      </section>


      {/* ===================================
          QUICK DISCOVERY STRIP
      =================================== */}

      <section className="home-discovery">

        <div className="home-discovery-intro">

          <span>
            QUICK DISCOVERY
          </span>

          <h2>
            What do you need today?
          </h2>

        </div>


        <div className="home-discovery-links">

          {categories
            .slice(0, 6)
            .map((category) => (
              <a
                href="#categories"
                key={category.id}
              >

                <span>
                  {category.icon}
                </span>

                {category.name}

              </a>
            ))}

        </div>

      </section>


      {/* ===================================
          TWO-SIDED VALUE SECTION
      =================================== */}

      <section className="home-path-section">

        <div className="home-section-heading">

          <span>
            ONE ACCOUNT. TWO POSSIBILITIES.
          </span>

          <h2>
            Need help today?
            <br />
            Want to earn tomorrow?
          </h2>

          <p>
            You never have to choose a permanent
            role on Karviam. Hire when you need
            help and apply when you want to work.
          </p>

        </div>


        <div className="home-path-grid">

          <article className="home-path-card home-path-hire">

            <div className="path-number">
              01
            </div>

            <div className="path-icon">
              👤
            </div>

            <span className="path-label">
              FOR HIRING
            </span>

            <h3>
              Get work done nearby.
            </h3>

            <p>
              Post what you need, receive
              applicants and choose the right
              person for your work.
            </p>

            <Link
              to={
                currentUser
                  ? "/post-work"
                  : "/login"
              }
            >
              Post Work
              <span>→</span>
            </Link>

          </article>


          <article className="home-path-card home-path-work">

            <div className="path-number">
              02
            </div>

            <div className="path-icon">
              💼
            </div>

            <span className="path-label">
              FOR EARNING
            </span>

            <h3>
              Find work around you.
            </h3>

            <p>
              Browse local opportunities,
              apply quickly and manage your
              work journey from one place.
            </p>

            <a href="#jobs">
              Explore Work
              <span>→</span>
            </a>

          </article>

        </div>

      </section>


      {/* ===================================
          CATEGORIES
      =================================== */}

      <section
        className="home-categories"
        id="categories"
      >

        <div className="home-section-heading centered">

          <span>
            EXPLORE KARVIAM
          </span>

          <h2>
            Find what you need.
          </h2>

          <p>
            Local work categories for everyday
            needs and earning opportunities.
          </p>

        </div>


        <div className="home-categories-grid">

          {categories.map(
            (category, index) => (
              <a
                href="#jobs"
                className="home-category-card"
                onClick={() => setJobFilters({ location: area, search: "", category: category.name.toUpperCase() })}
                key={category.id}
              >

                <div className="category-top">

                  <div
                    className={
                      index % 2 === 0
                        ? "category-icon orange"
                        : "category-icon green"
                    }
                  >
                    {category.icon}
                  </div>

                  <span>
                    0{index + 1}
                  </span>

                </div>


                <h3>
                  {category.name}
                </h3>

                <p>
                  {category.description}
                </p>


                <div className="category-arrow">
                  →
                </div>

              </a>
            )
          )}

        </div>

      </section>


      {/* ===================================
          HOW IT WORKS
      =================================== */}

      <section
        className="home-how"
        id="how"
      >

        <div className="home-how-top">

          <div className="home-section-heading">

            <span>
              HOW KARVIAM WORKS
            </span>

            <h2>
              Simple from start
              to finish.
            </h2>

          </div>

          <p>
            Designed to make local hiring and
            finding work straightforward.
          </p>

        </div>


        <div className="home-how-grid">

          <article>
            <span className="how-step">
              01
            </span>

            <div className="how-step-icon">
              ✍️
            </div>

            <h3>
              Post or explore
            </h3>

            <p>
              Create a work requirement or
              discover available opportunities
              nearby.
            </p>
          </article>


          <article className="featured">

            <span className="how-step">
              02
            </span>

            <div className="how-step-icon">
              🤝
            </div>

            <h3>
              Apply or select
            </h3>

            <p>
              Apply for the right job or
              review people interested in
              your posted work.
            </p>
          </article>


          <article>
            <span className="how-step">
              03
            </span>

            <div className="how-step-icon">
              ✓
            </div>

            <h3>
              Complete and review
            </h3>

            <p>
              Stay connected, complete the
              work and build your reputation
              on Karviam.
            </p>
          </article>

        </div>

      </section>


      {/* ===================================
          NEARBY JOBS
      =================================== */}




      {/* ===================================
          TRUST SECTION
      =================================== */}

      <section className="home-trust-section home-profile-showcase" aria-labelledby="home-profile-heading">

        <div className="home-trust-content">

          <span className="trust-eyebrow">
            BUILT FOR LOCAL WORK
          </span>

          <h2 id="home-profile-heading">
            Work feels easier when everything is in one place.
          </h2>

          <p>
            From finding opportunities to
            contacting people, chatting,
            tracking applications and
            reviews — Karviam keeps the
            whole journey together.
          </p>


          <div className="trust-points">

            <div>
              <span>01</span>

              <strong>
                One account
              </strong>

              <p>
                Hire and work without
                switching profiles.
              </p>
            </div>


            <div>
              <span>02</span>

              <strong>
                Local first
              </strong>

              <p>
                Opportunities designed
                around nearby work.
              </p>
            </div>


            <div>
              <span>03</span>

              <strong>
                Stay connected
              </strong>

              <p>
                Chat and manage your
                work in one place.
              </p>
            </div>

          </div>

        </div>


        <div className="home-trust-card">
          <div className="trust-card-top">
            <img src="/karviam-icon.png" alt="Karviam" width="40" height="40" />
            <span className="trust-card-label">KARVIAM PROFILE</span>
            <span className="trust-demo-member">DEMO MEMBER</span>
          </div>

          <div className="trust-profile">
            <img
              className="trust-avatar"
              src="/demo-workers/ashwin.png"
              alt="Ashwin, demo profile"
              width="100"
              height="100"
              loading="lazy"
              decoding="async"
            />
            <div className="trust-profile-details">
              <h3>Ashwin</h3>
              <p className="trust-profile-role">Driver</p>
              <p className="trust-profile-location">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                Patna
              </p>
              <span className="trust-availability">Available Today</span>
            </div>
          </div>

          <ul className="trust-card-capabilities" aria-label="Karviam profile possibilities">
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="7" width="18" height="14" rx="3" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12a24 24 0 0 0 18 0M12 12v3" />
              </svg>
              <span>Hire</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="4" width="16" height="17" rx="3" />
                <path d="M9 3h6M8 13l3 3 5-6" />
              </svg>
              <span>Work</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 20h16M6 16l5-5 4 2 5-8M15 5h5v5" />
              </svg>
              <span>Build Reputation</span>
            </li>
          </ul>

          <div className="trust-card-status">
            <p>Member <strong>2026</strong></p>
            <span className="trust-demo-profile">DEMO PROFILE</span>
          </div>
        </div>


      </section>


      {/* ===================================
          FINAL CTA
      =================================== */}

      <section className="home-trust-features home-trust-editorial" id="trust" aria-labelledby="home-trust-heading">
        <div className="home-trust-features-inner">
          <div className="home-trust-features-heading">
            <div>
            <span className="home-trust-features-label">TRUST ON KARVIAM</span>
            <h2 id="home-trust-heading">
              <span>Trust</span> grows with every completed work.
            </h2>
            </div>
            <p>
              Karviam helps people build confidence through verified email,
              completed work, ratings, reviews and direct communication.
            </p>
          </div>

          <ul className="home-trust-features-grid">
            <li>
              <span className="home-trust-feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </span>
              <h3>Email Verified</h3>
              <p>OTP-confirmed account email</p>
            </li>
            <li>
              <span className="home-trust-feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M20 11.5a8 8 0 0 1-8 8H4l1.5-4A8 8 0 1 1 20 11.5Z" />
                  <path d="M8 9h8M8 13h5" />
                </svg>
              </span>
              <h3>Ratings &amp; Reviews</h3>
              <p>Feedback after completed work</p>
            </li>
            <li>
              <span className="home-trust-feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <rect x="4" y="5" width="16" height="16" rx="3" />
                  <path d="M9 3h6v4H9zM8 14l3 3 5-6" />
                </svg>
              </span>
              <h3>Completed Work</h3>
              <p>Build reputation over time</p>
            </li>
            <li>
              <span className="home-trust-feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M14 3H6a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h1v4l4-4h3a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3Z" />
                  <path d="M17 8h1a3 3 0 0 1 3 3v10l-4-4h-4" />
                </svg>
              </span>
              <h3>Direct Connection</h3>
              <p>Chat and contact details after work is accepted</p>
            </li>
          </ul>
          <p className="home-trust-statement">Built through real activity, not empty badges.</p>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-top">
            <div className="home-footer-brand">
              <Link className="home-footer-logo" to="/" aria-label="Karviam home">
                <img src="/karviam-logo.png" alt="Karviam" width="180" loading="lazy" />
              </Link>
              <p className="home-footer-tagline">People &bull; Work &bull; Near You</p>
              <p>Local short-term work, made simpler.</p>
              <p className="home-footer-location">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
                Local opportunities around your city
              </p>
            </div>
            <nav aria-labelledby="footer-explore-heading">
              <h2 id="footer-explore-heading">EXPLORE</h2>
              <a href="#jobs">Find Work</a>
              <Link to={currentUser ? "/post-work" : "/login"}>Post Work</Link>
              <a href="#categories">Categories</a>
              <a href="#how">How It Works</a>
            </nav>
            <nav aria-labelledby="footer-account-heading">
              <h2 id="footer-account-heading">YOUR KARVIAM</h2>
              {currentUser ? (
                <>
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/my-jobs">My Posted Jobs</Link>
                  <Link to="/my-applications">My Applications</Link>
                  <Link to="/profile">Profile</Link>
                </>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/signup">Sign Up</Link>
                </>
              )}
            </nav>
            <nav aria-labelledby="footer-trust-heading">
              <h2 id="footer-trust-heading">TRUST &amp; SUPPORT</h2>
              <a href="#trust">Email Verification</a>
              <a href="#trust">Ratings &amp; Reviews</a>
              <a href="#trust">Completed Work</a>
              <a href="#trust">Direct Connection</a>
            </nav>
            <div className="home-footer-contact" role="group" aria-labelledby="footer-contact-heading">
              <h2 id="footer-contact-heading">CONTACT</h2>
              <div className="home-footer-contact-rows">
                <a href="mailto:karviamofficial@gmail.com" aria-label="Email Karviam">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                  <span>karviamofficial@gmail.com</span>
                </a>
                <a href="tel:+917992411134" aria-label="Call Karviam">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.79a2 2 0 0 1-.45 2.11L8.09 9.89a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.33 1.83.56 2.79.69A2 2 0 0 1 22 16.92Z" />
                  </svg>
                  <span>+91 7992411134</span>
                </a>
              </div>
            </div>
          </div>
          <div className="home-footer-bottom">
            <span>&copy; 2026 Karviam</span>
            <span className="home-footer-bottom-tagline">People &bull; Work &bull; Near You</span>
            <button className="home-footer-back-top" type="button" aria-label="Back to top"
              onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}>
              <span aria-hidden="true">↑</span>
            </button>
          </div>
        </div>
      </footer>

    </main>
  );
}

export default Home;
