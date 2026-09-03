import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import API_URL from "../api";
import "./MyJobs.css";

function MyJobs() {
  const token = localStorage.getItem("kaamonToken");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function formatJobDate(dateValue) {
  if (!dateValue) return "";

  return String(dateValue).split("T")[0];
}

  useEffect(() => {
    async function loadMyJobs() {
      try {
        const response = await fetch(
          `${API_URL}/api/my-jobs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message || "Could not load your jobs."
          );
          return;
        }

        setJobs(data);

      } catch (error) {
        console.error("My jobs error:", error);

        setError(
          "Could not connect to KaamON server."
        );

      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadMyJobs();
    } else {
      setLoading(false);
    }
  }, [token]);


  if (!token) {
    return <Navigate to="/login" />;
  }


  if (loading) {
    return (
      <main className="my-jobs-page">
        <div className="my-jobs-container">
          <h2>Loading your jobs...</h2>
        </div>
      </main>
    );
  }


  return (
    <main className="my-jobs-page">

      <div className="my-jobs-container">

        <Link
          to="/dashboard"
          className="my-jobs-back"
        >
          ← Back to Dashboard
        </Link>

        <div className="my-jobs-heading">
          <span>YOUR WORK POSTS</span>

          <h1>My Posted Jobs</h1>

          <p>
            Manage the work opportunities you have posted.
          </p>
        </div>


        {error && (
          <p className="my-jobs-error">
            {error}
          </p>
        )}


        {!error && jobs.length === 0 && (
          <div className="no-my-jobs">
            <h2>No jobs posted yet</h2>

            <p>
              Post your first work requirement on KaamON.
            </p>

            <Link to="/post-work">
              Post Work →
            </Link>
          </div>
        )}


        <div className="my-jobs-grid">

          {jobs.map((job) => (

            <div
              className="my-job-card"
              key={job.id}
            >

              <div className="my-job-top">

                <div className="my-job-icon">
                  {job.icon || "💼"}
                </div>

                <div>
                  <span>
                    {job.category}
                  </span>

                  <h2>
                    {job.title}
                  </h2>
                </div>

              </div>


              <p className="my-job-description">
                {job.description}
              </p>


              <div className="my-job-details">

                <span>
                  📍 {job.location}
                </span>

                <span>
                  📅 {formatJobDate(job.work_date)}
                </span>

                <span>
                  🕘 {job.work_time}
                </span>

              </div>


              <div className="my-job-bottom">

                <div>
                  <small>Payment</small>

                  <strong>
                    ₹
                    {Number(
                      job.payment
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>


                <div className="applicant-area">

                  <span className="applicant-count">
                    {job.applicant_count}{" "}
                    {job.applicant_count === 1
                      ? "Applicant"
                      : "Applicants"}
                  </span>

                  <Link
                    to={`/jobs/${job.id}/applicants`}
                    className="view-applicants-btn"
                  >
                    View Applicants →
                  </Link>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}

export default MyJobs;