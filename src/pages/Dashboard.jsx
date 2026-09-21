import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { requestArray } from "../api/requestArray";
import "./Dashboard.css";

function Dashboard() {
  const savedUser = localStorage.getItem("kaamonCurrentUser");
  const currentUser = useMemo(
    () => { try { return JSON.parse(savedUser); } catch { return null; } },
    [savedUser]
  );

  const [jobsPosted, setJobsPosted] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [acceptedWork, setAcceptedWork] = useState(0);
  const [completedWork, setCompletedWork] = useState(0);

  const token = localStorage.getItem("kaamonToken");
  const userId = currentUser?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadDashboardData() {
      setLoading(true);
      setError("");
      setAuthError(false);
      try {
        if (!token) throw Object.assign(new Error("Please log in to load your workspace."), { status: 401 });
        const [myJobs, applications] = await Promise.all([
          requestArray("/api/my-jobs", { token, signal: controller.signal }),
          requestArray("/api/my-applications", { token, signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;
        setJobsPosted(myJobs.length);
        setApplicationsCount(applications.length);
        setAcceptedWork(applications.filter((application) => application.status === "accepted").length);
        setCompletedWork(applications.filter((application) => application.status === "completed").length);
      } catch (error) {
        if (controller.signal.aborted) return;
        setError(error.message);
        setAuthError(error.status === 401 || error.status === 403);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadDashboardData();
    return () => controller.abort();
  }, [token, userId, attempt]);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const totalActivity = jobsPosted + applicationsCount;

  return (
    <main className="dashboard-page">
      <div className="dashboard-shell">
        {/* TOP HEADER */}
        <section className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <p className="dashboard-eyebrow">
              MY WORKSPACE
            </p>

            <h1>
              Good to see you,<br />
              <span className="dashboard-name">
                {currentUser.name}
              </span>{" "}
              <span className="dashboard-wave">👋</span>
            </h1>

            <p className="dashboard-subtitle">
              Manage hiring, applications and local work from one place.
            </p>
          </div>

          <div className="dashboard-topbar-actions">
            <Link
              to="/post-work"
              className="dashboard-solid-btn"
            >
              + Post Work
            </Link>

            <a
              href="/#jobs"
              className="dashboard-outline-btn"
            >
              Explore Work &rarr;
            </a>
          </div>
        </section>

        {loading && <p role="status">Loading your workspace...</p>}
        {!loading && error && <div role="alert">
          <p>{error}</p>
          <button type="button" className="dashboard-outline-btn" onClick={() => setAttempt((value) => value + 1)}>Retry</button>
          {authError && <Link to="/login" className="dashboard-outline-btn">Log in</Link>}
        </div>}
        {/* STAT STRIP */}
        <section className="dashboard-stats-strip" aria-label="Your work statistics" aria-busy={loading}>
          <div className="stats-pill">
            <span className="stats-pill-icon">📌</span>
            <div>
              <strong>{loading || error ? "\u2014" : jobsPosted}</strong>
              <p>Jobs Posted</p>
            </div>
          </div>

          <div className="stats-pill">
            <span className="stats-pill-icon">📨</span>
            <div>
              <strong>{loading || error ? "\u2014" : applicationsCount}</strong>
              <p>Applications Sent</p>
            </div>
          </div>

          <div className="stats-pill">
            <span className="stats-pill-icon">🤝</span>
            <div>
              <strong>{loading || error ? "\u2014" : acceptedWork}</strong>
              <p>Accepted Work</p>
            </div>
          </div>

          <div className="stats-pill">
            <span className="stats-pill-icon">✅</span>
            <div>
              <strong>{loading || error ? "\u2014" : completedWork}</strong>
              <p>Completed Work</p>
            </div>
          </div>
        </section>

        {/* MAIN BOARD */}
        <section className="dashboard-board">
          {/* LEFT / CENTER */}
          <div className="dashboard-main">
            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-kicker">
                    QUICK ACCESS
                  </p>
                  <h2>What would you like to do?</h2>
                </div>
              </div>

              <div className="dashboard-actions-grid">
                <div className="action-work-card">
                  <div className="action-card-top">
                    <div className="action-icon">
                      👤
                    </div>
                    <span className="action-number">
                      01
                    </span>
                  </div>

                  <p className="action-label">
                    HIRE NEARBY
                  </p>
                  <h3>I Need Someone</h3>
                  <p className="action-description">
                    Post your requirement, review applicants and choose someone nearby.
                  </p>

                  <div className="action-tags">
                    <span>✓ Post local work</span>
                    <span>✓ Review applicants</span>
                  </div>

                  <div className="action-links">
                    <Link
                      to="/post-work"
                      className="action-primary-btn"
                    >
                      Post Work →
                    </Link>

                    <Link
                      to="/my-jobs"
                      className="action-secondary-btn"
                    >
                      My Posted Jobs
                    </Link>
                  </div>
                </div>

                <div className="action-work-card">
                  <div className="action-card-top">
                    <div className="action-icon">
                      💼
                    </div>
                    <span className="action-number">
                      02
                    </span>
                  </div>

                  <p className="action-label">
                    FIND OPPORTUNITIES
                  </p>
                  <h3>I Want to Work</h3>
                  <p className="action-description">
                    Explore nearby work, apply quickly and track your applications.
                  </p>

                  <div className="action-tags">
                    <span>✓ Explore local work</span>
                    <span>✓ Track applications</span>
                  </div>

                  <div className="action-links">
                    <a
                      href="/#jobs"
                      className="action-primary-btn"
                    >
                      Find Work →
                    </a>

                    <Link
                      to="/my-applications"
                      className="action-secondary-btn"
                    >
                      My Applications
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="dashboard-sidebar">
            <div className="dashboard-side-card dashboard-side-highlight">
              <p className="panel-kicker">
                WORKSPACE SUMMARY
              </p>

              <h3>{loading || error ? "\u2014" : totalActivity}</h3>

              <p className="side-summary-text">
                Total activity
              </p>

              <div className="side-summary-grid">
                <div>
                  <strong>{loading || error ? "\u2014" : acceptedWork}</strong>
                  <span>Active Work</span>
                </div>

                <div>
                  <strong>{loading || error ? "\u2014" : completedWork}</strong>
                  <span>Completed Work</span>
                </div>
              </div>
            </div>

            <div className="dashboard-side-card">
              <p className="panel-kicker">
                SHORTCUTS
              </p>

              <h4>Move faster</h4>

              <div className="shortcut-list">
                <Link to="/post-work">
                  <span aria-hidden="true">+</span> Create a new work post
                </Link>

                <Link to="/my-jobs">
                  <span aria-hidden="true">&rarr;</span> Manage my posted jobs
                </Link>

                <Link to="/my-applications">
                  <span aria-hidden="true">&rarr;</span> Track my applications
                </Link>

                <a href="/#jobs">
                  <span aria-hidden="true">&rarr;</span> Explore nearby work
                </a>
              </div>
            </div>

          </aside>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
