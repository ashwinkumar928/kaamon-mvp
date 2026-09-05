import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useParams,
} from "react-router-dom";

import API_URL from "../api";
import "./Applicants.css";

function Applicants() {
  const { jobId } = useParams();

  const token =
    localStorage.getItem("kaamonToken");

  const [applicants, setApplicants] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // REVIEW STATES
  const [reviewRatings, setReviewRatings] =
    useState({});

  const [reviewComments, setReviewComments] =
    useState({});

  const [
    reviewedApplications,
    setReviewedApplications,
  ] = useState({});

  const [reviewMessages, setReviewMessages] =
    useState({});

  const [
    reviewSubmitting,
    setReviewSubmitting,
  ] = useState({});


  // ==============================
  // LOAD APPLICANTS
  // ==============================

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

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Could not load applicants."
          );

          return;
        }

        setApplicants(data);

      } catch (error) {
        console.error(
          "Applicants error:",
          error
        );

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


  // ==============================
  // CHECK EXISTING REVIEWS
  // ==============================

  useEffect(() => {
    async function checkReviews() {
      const completedApplicants =
        applicants.filter(
          (applicant) =>
            applicant.status === "completed"
        );

      for (const applicant of completedApplicants) {
        try {
          const response = await fetch(
            `${API_URL}/api/applications/${applicant.application_id}/my-review`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            continue;
          }

          const data =
            await response.json();

          setReviewedApplications(
            (current) => ({
              ...current,
              [applicant.application_id]:
                data.reviewed,
            })
          );

        } catch (error) {
          console.error(
            "Could not check review:",
            error
          );
        }
      }
    }

    if (
      token &&
      applicants.length > 0
    ) {
      checkReviews();
    }

  }, [applicants, token]);


  // ==============================
  // CHANGE APPLICATION STATUS
  // ==============================

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
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Could not update application."
        );

        return;
      }

      setApplicants(
        (currentApplicants) =>
          currentApplicants.map(
            (applicant) =>
              applicant.application_id ===
              applicationId
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


  // ==============================
  // SUBMIT WORKER REVIEW
  // ==============================

  async function handleSubmitReview(
    applicationId
  ) {
    const rating =
      reviewRatings[applicationId];

    const comment =
      reviewComments[applicationId] || "";

    if (!rating) {
      setReviewMessages(
        (current) => ({
          ...current,
          [applicationId]:
            "Please select a rating.",
        })
      );

      return;
    }

    try {
      setReviewSubmitting(
        (current) => ({
          ...current,
          [applicationId]: true,
        })
      );

      setReviewMessages(
        (current) => ({
          ...current,
          [applicationId]: "",
        })
      );

      const response = await fetch(
        `${API_URL}/api/reviews`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            applicationId,
            rating,
            comment,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setReviewMessages(
          (current) => ({
            ...current,
            [applicationId]:
              data.message ||
              "Could not submit review.",
          })
        );

        return;
      }

      setReviewedApplications(
        (current) => ({
          ...current,
          [applicationId]: true,
        })
      );

      setReviewMessages(
        (current) => ({
          ...current,
          [applicationId]:
            "Review submitted successfully.",
        })
      );

    } catch (error) {
      console.error(
        "Submit review error:",
        error
      );

      setReviewMessages(
        (current) => ({
          ...current,
          [applicationId]:
            "Could not connect to KaamON server.",
        })
      );

    } finally {
      setReviewSubmitting(
        (current) => ({
          ...current,
          [applicationId]: false,
        })
      );
    }
  }


  // ==============================
  // AUTH CHECK
  // ==============================

  if (!token) {
    return <Navigate to="/login" />;
  }


  if (loading) {
    return (
      <main className="applicants-page">
        <div className="applicants-container">
          <h2>
            Loading applicants...
          </h2>
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

          <span>
            JOB APPLICANTS
          </span>

          <h1>Applicants</h1>

          <p>
            Review people who applied
            for this work.
          </p>

        </div>


        {error && (
          <p className="applicants-error">
            {error}
          </p>
        )}


        {!error &&
          applicants.length === 0 && (
            <div className="no-applicants">

              <h2>
                No applicants yet
              </h2>

              <p>
                Nobody has applied for
                this job yet.
              </p>

            </div>
          )}


        <div className="applicants-list">

          {applicants.map(
            (applicant) => (

              <div
                className="applicant-card"
                key={
                  applicant.application_id
                }
              >

                {/* APPLICANT PROFILE */}

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
                      {applicant.email ||
                        "Contact available after acceptance"}
                    </p>

                    <Link
                      to={`/users/${applicant.applicant_id}?jobId=${jobId}`}
                      className="view-profile-btn"
                    >
                      View Profile
                    </Link>

                  </div>

                </div>


                {/* STATUS */}

                <div className="applicant-status">

                  <span
                    className={`status-${applicant.status}`}
                  >
                    {applicant.status}
                  </span>


                  {/* ACCEPT / REJECT */}

                  {applicant.status ===
                    "pending" && (

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


                  {/* COMPLETE */}

                  {applicant.status ===
                    "accepted" && (

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


                {/* HIRER → WORKER REVIEW */}

                {applicant.status ===
                  "completed" && (

                  <div className="applicant-review-section">

                    {reviewedApplications[
                      applicant.application_id
                    ] ? (

                      <div className="applicant-review-submitted">
                        ⭐ Review Submitted
                      </div>

                    ) : (

                      <>

                        <h3>
                          Rate Worker
                        </h3>

                        <p>
                          How was your
                          experience working
                          with{" "}
                          {applicant.name}?
                        </p>


                        <div className="applicant-review-stars">

                          {[1, 2, 3, 4, 5].map(
                            (star) => (

                              <button
                                key={star}
                                type="button"
                                className={
                                  star <=
                                  (reviewRatings[
                                    applicant
                                      .application_id
                                  ] || 0)
                                    ? "applicant-review-star selected"
                                    : "applicant-review-star"
                                }
                                onClick={() =>
                                  setReviewRatings(
                                    (current) => ({
                                      ...current,
                                      [applicant.application_id]:
                                        star,
                                    })
                                  )
                                }
                              >
                                ★
                              </button>

                            )
                          )}

                        </div>


                        <textarea
                          className="applicant-review-comment"
                          placeholder="Write a short review (optional)"
                          value={
                            reviewComments[
                              applicant
                                .application_id
                            ] || ""
                          }
                          onChange={(event) =>
                            setReviewComments(
                              (current) => ({
                                ...current,
                                [applicant.application_id]:
                                  event.target.value,
                              })
                            )
                          }
                        />


                        <button
                          type="button"
                          className="applicant-submit-review-btn"
                          disabled={
                            reviewSubmitting[
                              applicant
                                .application_id
                            ]
                          }
                          onClick={() =>
                            handleSubmitReview(
                              applicant
                                .application_id
                            )
                          }
                        >
                          {reviewSubmitting[
                            applicant
                              .application_id
                          ]
                            ? "Submitting..."
                            : "Submit Review"}
                        </button>

                      </>
                    )}


                    {reviewMessages[
                      applicant.application_id
                    ] && (

                      <p className="applicant-review-message">
                        {
                          reviewMessages[
                            applicant
                              .application_id
                          ]
                        }
                      </p>

                    )}

                  </div>
                )}

              </div>

            )
          )}

        </div>

      </div>

    </main>
  );
}

export default Applicants;