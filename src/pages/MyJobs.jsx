import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { requestArray } from "../api/requestArray";
import "./MyJobs.css";
import "./InternalPages.css";

function MyJobs() {
  const token = localStorage.getItem("kaamonToken");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [attempt, setAttempt] = useState(0);
  const [authError, setAuthError] = useState(false);

  function formatJobDate(dateValue) {
  if (!dateValue) return "";

  return String(dateValue).split("T")[0];
}

  useEffect(() => {
    const controller = new AbortController();
    async function loadMyJobs() {
      setLoading(true);
      setError("");
      setAuthError(false);
      try {
        if (!token) return;
        const data = await requestArray("/api/my-jobs", { token, signal: controller.signal });
        if (!controller.signal.aborted) setJobs(data);
      } catch (error) {
        if (controller.signal.aborted) return;
        setError(error.message);
        setAuthError(error.status === 401 || error.status === 403);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadMyJobs();
    return () => controller.abort();
  }, [token, attempt]);


  if (!token) {
    return <Navigate to="/login" />;
  }


  if (loading) {
    return (
      <main className="my-jobs-page karviam-internal">
        <div className="my-jobs-container">
          <h2>Loading your jobs...</h2>
        </div>
      </main>
    );
  }


  return (
    <main className="my-jobs-page karviam-internal">

      <div className="my-jobs-container">

        <Link
          to="/dashboard"
          className="my-jobs-back"
        >
          ← Back to Dashboard
        </Link>

        <div className="my-jobs-heading">
          <Link to="/post-work" className="internal-header-action">Post Work &rarr;</Link>
          <span>YOUR WORK POSTS</span>

          <h1>My Posted Jobs</h1>

          <p>
            Manage work you have posted and review applicants.
          </p>
        </div>


        {error && (
          <div className="my-jobs-error" role="alert">
            <p>{error}</p>
            <button type="button" className="view-applicants-btn" onClick={() => setAttempt((value) => value + 1)}>Retry</button>
            {authError && <Link to="/login" className="view-applicants-btn">Log in</Link>}
          </div>
        )}


        {!error && jobs.length === 0 && (
          <div className="no-my-jobs"><span className="internal-empty-icon" aria-hidden="true">+</span>
            <h2>No work posted yet</h2>

            <p>
              Post your first requirement to start finding nearby help.
            </p>

            <Link to="/post-work">
              Post Work →
            </Link>
          </div>
        )}


        <div className="my-jobs-grid">

          {!error && jobs.map((job) => (

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

  <span
    className={`my-job-status status-${job.job_status}`}
  >
    {job.job_status === "filled"
      ? "Filled"
      : job.job_status === "completed"
      ? "Completed"
      : "Available"}
  </span>

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

  {job.job_status === "available" && (
    <Link
      to={`/my-jobs/${job.id}/edit`}
      className="view-applicants-btn"
    >
      ✏️ Edit Work
    </Link>
  )}

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