import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./JobDetails.css";
import API_URL from "../api";

function JobDetails() {
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    async function loadJob() {
      try {
        const response = await fetch(
  `             ${API_URL}/api/jobs/${jobId}`);

        if (!response.ok) {
          setJob(null);
          return;
        }

        const data = await response.json();

        setJob(data);
      } catch (error) {
        console.error("Could not load job:", error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [jobId]);

  if (loading) {
    return (
      <main className="job-details-page">
        <h2>Loading job...</h2>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="job-details-page">
        <h2>Job not found</h2>

        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="job-details-page">
      <div className="job-details-container">

        <Link to="/" className="back-link">
          ← Back to Opportunities
        </Link>

        <div className="job-details-card">

          <div className="details-header">

            <div className="details-icon">
              {job.icon}
            </div>

            <div>
              <span className="details-category">
                {job.category}
              </span>

              <h1>{job.title}</h1>
            </div>

          </div>


          <p className="details-description">
            {job.description}
          </p>


          <div className="details-grid">

            <div className="detail-item">
              <span>📍</span>

              <div>
                <small>Location</small>
                <strong>{job.location}</strong>
              </div>
            </div>


            <div className="detail-item">
              <span>📅</span>

              <div>
                <small>Date</small>
                <strong>{job.date}</strong>
              </div>
            </div>


            <div className="detail-item">
              <span>🕘</span>

              <div>
                <small>Timing</small>
                <strong>{job.time}</strong>
              </div>
            </div>


            <div className="detail-item">
              <span>📏</span>

              <div>
                <small>Distance</small>
                <strong>{job.distance}</strong>
              </div>
            </div>

          </div>


          <div className="posted-by">

            <div className="poster-avatar">
              {job.postedBy?.name
                ? job.postedBy.name.charAt(0).toUpperCase()
                : "AK"}
            </div>

            <div>
              <small>Posted by</small>

              <strong>
                {job.postedBy?.name || "Amit Kumar"}
              </strong>

              <p>
                ⭐ 4.7 &nbsp; • &nbsp; ✓ Phone Verified
              </p>
            </div>

          </div>


          <div className="apply-section">

            <div>
              <small>Payment</small>

              <h2>
                ₹{Number(job.payment).toLocaleString("en-IN")}
              </h2>
            </div>

            <button
              className={
                applied
                  ? "apply-job-btn applied"
                  : "apply-job-btn"
              }
              onClick={() => setApplied(true)}
              disabled={applied}
            >
              {applied
                ? "✓ Application Sent"
                : "Apply for Work"}
            </button>

          </div>

        </div>
      </div>
    </main>
  );
}

export default JobDetails;