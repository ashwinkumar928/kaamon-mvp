import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import API_URL from "../api";
import "./Dashboard.css";

function Dashboard() {
  const savedUser = localStorage.getItem("kaamonCurrentUser");
  const currentUser = useMemo(
    () => JSON.parse(savedUser),
    [savedUser]
  );

  const [jobsPosted, setJobsPosted] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [acceptedWork, setAcceptedWork] = useState(0);
  const [completedWork, setCompletedWork] = useState(0);

  useEffect(() => {
    async function loadDashboardData() {
      if (!currentUser) return;

      try {
        const token = localStorage.getItem("kaamonToken");

        const [myJobsResponse, applicationsResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/my-jobs`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch(`${API_URL}/api/my-applications`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        if (myJobsResponse.ok) {
          const myJobs = await myJobsResponse.json();
          setJobsPosted(myJobs.length);
        }

        if (applicationsResponse.ok) {
          const applications =
            await applicationsResponse.json();

          setApplicationsCount(applications.length);

          const accepted = applications.filter(
            (application) =>
              application.status === "accepted"
          );

          const completed = applications.filter(
            (application) =>
              application.status === "completed"
          );

          setAcceptedWork(accepted.length);
          setCompletedWork(completed.length);
        }
      } catch (error) {
        console.error(
          "Could not load dashboard data:",
          error
        );
      }
    }

    loadDashboardData();
  }, [currentUser]);

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
              Good to see you,{" "}
              <span className="dashboard-name">
                {currentUser.name}
              </span>{" "}
              <span className="dashboard-wave">👋</span>
            </h1>

            <p className="dashboard-subtitle">
              Manage hiring, work applications and
              local opportunities from one premium
              workspace.
            </p>
          </div>

          <div className="dashboard-topbar-actions">
            <Link
              to="/post-work"
              className="dashboard-solid-btn"
            >
              + New Post
            </Link>

            <Link
              to="/#jobs"
              className="dashboard-outline-btn"
            >
              Explore Work
            </Link>
          </div>
        </section>

        {/* STAT STRIP */}
        <section className="dashboard-stats-strip">
          <div className="stats-pill">
            <span className="stats-pill-icon">📌</span>
            <div>
              <strong>{jobsPosted}</strong>
              <p>Jobs Posted</p>
            </div>
          </div>

          <div className="stats-pill">
            <span className="stats-pill-icon">📨</span>
            <div>
              <strong>{applicationsCount}</strong>
              <p>Applications Sent</p>
            </div>
          </div>

          <div className="stats-pill">
            <span className="stats-pill-icon">🤝</span>
            <div>
              <strong>{acceptedWork}</strong>
              <p>Accepted Work</p>
            </div>
          </div>

          <div className="stats-pill">
            <span className="stats-pill-icon">✅</span>
            <div>
              <strong>{completedWork}</strong>
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
                    Post your requirement, discover
                    nearby people and manage applicants
                    easily.
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
                    Explore nearby work, apply quickly
                    and track every application from one
                    place.
                  </p>

                  <div className="action-tags">
                    <span>✓ Explore local work</span>
                    <span>✓ Track applications</span>
                  </div>

                  <div className="action-links">
                    <Link
                      to="/#jobs"
                      className="action-primary-btn"
                    >
                      Find Work →
                    </Link>

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

            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-kicker">
                    OVERVIEW
                  </p>
                  <h2>Performance snapshot</h2>
                </div>
              </div>

              <div className="performance-grid">
                <div className="mini-card">
                  <span>📝</span>
                  <h4>{jobsPosted}</h4>
                  <p>Work posts created by you</p>
                </div>

                <div className="mini-card">
                  <span>📨</span>
                  <h4>{applicationsCount}</h4>
                  <p>Jobs you have applied for</p>
                </div>

                <div className="mini-card">
                  <span>🤝</span>
                  <h4>{acceptedWork}</h4>
                  <p>Applications accepted</p>
                </div>

                <div className="mini-card">
                  <span>🏁</span>
                  <h4>{completedWork}</h4>
                  <p>Completed work count</p>
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

              <h3>{totalActivity}</h3>

              <p className="side-summary-text">
                Total jobs posted and applications sent
              </p>

              <div className="side-summary-grid">
                <div>
                  <strong>{acceptedWork}</strong>
                  <span>Active work</span>
                </div>

                <div>
                  <strong>{completedWork}</strong>
                  <span>Completed</span>
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
                  Create a new work post
                </Link>

                <Link to="/my-jobs">
                  Manage my posted jobs
                </Link>

                <Link to="/my-applications">
                  Track my applications
                </Link>

                <Link to="/#jobs">
                  Explore nearby jobs
                </Link>
              </div>
            </div>

            <div className="dashboard-side-card">
              <p className="panel-kicker">
                ACCOUNT MODE
              </p>

              <h4>One account, two roles</h4>
              <p className="side-paragraph">
                Karviam lets you hire people and also
                earn by applying for work using the same
                account.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
