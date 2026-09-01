import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import API_URL from "../api";
import "./Dashboard.css";

function Dashboard() {
  const currentUser = JSON.parse(
    localStorage.getItem("kaamonCurrentUser")
  );

  const [jobsPosted, setJobsPosted] = useState(0);

  useEffect(() => {
    async function loadDashboardData() {
      if (!currentUser) {
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/jobs`
        );

        const jobs = await response.json();

        const myJobs = jobs.filter((job) => {
          return (
            String(job.postedBy?.id) ===
            String(currentUser.id)
          );
        });

        setJobsPosted(myJobs.length);

      } catch (error) {
        console.error(
          "Could not load dashboard data:",
          error
        );
      }
    }

    loadDashboardData();
  }, [currentUser?.id]);


  if (!currentUser) {
    return <Navigate to="/login" />;
  }


  return (
    <main className="dashboard-page">

      <div className="dashboard-container">

        <p className="dashboard-small">
          WELCOME TO KAAMON
        </p>

        <h1>
          Hello, {currentUser.name} 👋
        </h1>

        <p className="dashboard-description">
          What would you like to do today?
        </p>


        <div className="dashboard-actions">

          <div className="dashboard-action-card">

            <div className="dashboard-icon">
              👤
            </div>

            <h2>I Need Someone</h2>

            <p>
              Post your requirement and find people
              available to work nearby.
            </p>

            <Link to="/post-work">
              Post Work →
            </Link>

            <Link to="/my-jobs"
                style={{ marginLeft: "10px" }}
              >
                My Posted Jobs
             </Link>

          </div>


          <div className="dashboard-action-card">

            <div className="dashboard-icon">
              💼
            </div>

            <h2>I Want to Work</h2>

            <p>
              Browse nearby work opportunities and
              apply using the same KaamON account.
            </p>

            <Link to="/#jobs">
              Find Work →
            </Link>

            <Link
               to="/my-applications"
               style={{ marginLeft: "10px" }}
            >
              My Applications
            </Link>

          </div>

        </div>


        <div className="dashboard-info">

          <div>
            <strong>{jobsPosted}</strong>
            <span>Jobs Posted</span>
          </div>

          <div>
            <strong>0</strong>
            <span>Applications</span>
          </div>

          <div>
            <strong>0</strong>
            <span>Completed Work</span>
          </div>

        </div>

      </div>

    </main>
  );
}

export default Dashboard;