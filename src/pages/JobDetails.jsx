import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import jobs from "../data/jobs";
import "./JobDetails.css";

function JobDetails() {
  const { jobId } = useParams();

  const [applied, setApplied] = useState(false);

  const job = jobs.find(
    (job) => job.id === Number(jobId)
  );

  if (!job) {
    return (
      <div className="job-details-page">
        <h2>Job not found</h2>

        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <main className="job-details-page">

      <div className="job-details-container">

        <Link to="/#jobs" className="back-link">
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
              AK
            </div>

            <div>
              <small>Posted by</small>

              <strong>Amit Kumar</strong>

              <p>
                ⭐ 4.7 &nbsp; • &nbsp; ✓ Phone Verified
              </p>
            </div>

          </div>


          <div className="apply-section">

            <div>
              <small>Payment</small>
              <h2>{job.payment}</h2>
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