import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import API_URL from "../api";
import "./Applicants.css";

function Applicants() {
  const { jobId } = useParams();

  const token = localStorage.getItem("kaamonToken");

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplicants() {
      try {
        const response = await fetch(
          `${API_URL}/api/jobs/${jobId}/applicants`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message || "Could not load applicants."
          );
          return;
        }

        setApplicants(data);

      } catch (error) {
        console.error("Applicants error:", error);

        setError(
          "Could not connect to KaamON server."
        );

      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadApplicants();
    } else {
      setLoading(false);
    }

  }, [jobId, token]);

  async function handleStatusChange(
  applicationId,
  newStatus
) {
  try {
    const response = await fetch(
      `${API_URL}/api/applications/${applicationId}/status`,
      {
        method: "PATCH",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(
        data.message ||
          "Could not update application."
      );
      return;
    }

    setApplicants((currentApplicants) =>
      currentApplicants.map((applicant) =>
        applicant.application_id === applicationId
          ? {
              ...applicant,
              status: newStatus,
            }
          : applicant
      )
    );

  } catch (error) {
    console.error(
      "Status update error:",
      error
    );

    alert(
      "Could not connect to KaamON server."
    );
  }
}


  if (!token) {
    return <Navigate to="/login" />;
  }


  if (loading) {
    return (
      <main className="applicants-page">
        <div className="applicants-container">
          <h2>Loading applicants...</h2>
        </div>
      </main>
    );
  }


  return (
    <main className="applicants-page">

      <div className="applicants-container">

        <Link
          to="/my-jobs"
          className="applicants-back"
        >
          ← Back to My Posted Jobs
        </Link>


        <div className="applicants-heading">
          <span>JOB APPLICANTS</span>

          <h1>Applicants</h1>

          <p>
            Review people who applied for this work.
          </p>
        </div>


        {error && (
          <p className="applicants-error">
            {error}
          </p>
        )}


        {!error && applicants.length === 0 && (
          <div className="no-applicants">
            <h2>No applicants yet</h2>

            <p>
              Nobody has applied for this job yet.
            </p>
          </div>
        )}


        <div className="applicants-list">

          {applicants.map((applicant) => (

            <div
              className="applicant-card"
              key={applicant.application_id}
            >

              <div className="applicant-profile">

                <div className="applicant-avatar">
                  {applicant.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h2>
                    {applicant.name}
                  </h2>

                  <p>
                    {applicant.email}
                  </p>

                  <Link
                      to={`/users/${applicant.applicant_id}?jobId=${jobId}`}
                      className="view-profile-btn"
                  >
                    View Profile
                  </Link>
                </div>

              </div>


             <div className="applicant-status">

  <span
    className={`status-${applicant.status}`}
  >
    {applicant.status}
  </span>


  {applicant.status === "pending" && (
    <div className="applicant-actions">

      <button
        className="accept-btn"
        onClick={() =>
          handleStatusChange(
            applicant.application_id,
            "accepted"
          )
        }
      >
        ✓ Accept
      </button>

      <button
        className="reject-btn"
        onClick={() =>
          handleStatusChange(
            applicant.application_id,
            "rejected"
          )
        }
      >
        ✕ Reject
      </button>

    </div>
  )}

  {applicant.status === "accepted" && (
  <div className="applicant-actions">

    <button
      className="complete-btn"
      onClick={() =>
        handleStatusChange(
          applicant.application_id,
          "completed"
        )
      }
    >
      ✓ Mark as Completed
    </button>

  </div>
)}

</div>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}

export default Applicants;