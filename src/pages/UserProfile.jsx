import { useEffect, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";
import API_URL from "../api";
import "./Profile.css";

function UserProfile() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [user, setUser] = useState(null);

  const [ratingData, setRatingData] = useState({
    averageRating: 0,
    reviewCount: 0,
    reviews: [],
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ==============================
  // LOAD USER PROFILE
  // ==============================
  useEffect(() => {
    async function loadUserProfile() {
      const token = localStorage.getItem("kaamonToken");

      try {
        const response = await fetch(
          `${API_URL}/api/users/${userId}/profile?jobId=${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(
            data.message || "Could not load profile."
          );
          return;
        }

        setUser(data);
      } catch (error) {
        console.error(
          "User profile error:",
          error
        );

        setMessage(
          "Could not connect to KaamON server."
        );
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [userId, jobId]);

  // ==============================
  // LOAD RATINGS AND REVIEWS
  // ==============================
  useEffect(() => {
    async function loadRatings() {
      const token =
        localStorage.getItem("kaamonToken");

      try {
        const response = await fetch(
          `${API_URL}/api/users/${userId}/reviews`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Could not load reviews."
          );
        }

        setRatingData(data);
      } catch (error) {
        console.error(
          "Rating load error:",
          error
        );
      }
    }

    loadRatings();
  }, [userId]);

  // ==============================
  // LOADING
  // ==============================
  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  // ==============================
  // PROFILE ERROR
  // ==============================
  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <p>{message}</p>

          <Link to="/dashboard">
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const firstLetter =
    user.name?.charAt(0).toUpperCase() || "U";

  return (
    <main className="profile-page">
      <div className="profile-container">

        {/* BACK BUTTON */}
        <Link
          to={
            jobId
              ? `/jobs/${jobId}/applicants`
              : "/dashboard"
          }
          className="profile-back"
        >
          {jobId
            ? "← Back to Applicants"
            : "← Back to Dashboard"}
        </Link>

        {/* PROFILE HEADER */}
        <section className="profile-header">
          <div className="profile-avatar">
            {firstLetter}
          </div>

          <div className="profile-main-info">
            <h1>{user.name}</h1>

            <p>
              {user.canViewContact
                ? user.email || "Email not added"
                : "Contact available after acceptance"}
            </p>

            <span className="profile-member">
              KaamON Worker
            </span>
          </div>
        </section>

        {/* WORKER INFORMATION */}
        <section className="profile-section">
          <div className="profile-section-heading">
            <div>
              <h2>Worker Information</h2>
              <p>
                Details shared by this KaamON member.
              </p>
            </div>
          </div>

          <div className="profile-info-grid">

            <div className="profile-info-item">
              <span>Full Name:</span>
              <strong>{user.name}</strong>
            </div>

            <div className="profile-info-item">
              <span>Email:</span>

              <strong>
                {user.canViewContact
                  ? user.email || "Not added yet"
                  : "Available after acceptance"}
              </strong>
            </div>

            <div className="profile-info-item">
              <span>Phone:</span>

              <strong>
                {user.canViewContact
                  ? user.phone || "Not added yet"
                  : "Available after acceptance"}
              </strong>
            </div>

            <div className="profile-info-item">
              <span>Location:</span>

              <strong>
                {user.location || "Not added yet"}
              </strong>
            </div>

          </div>

          {/* CONTACT BUTTONS */}
          {user.canViewContact && (
            <div className="worker-contact-actions">

              {user.phone && (
                <a
                  href={`tel:${user.phone}`}
                  className="worker-contact-btn"
                >
                  📞 Call
                </a>
              )}

              {user.email && (
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                    user.email
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="worker-contact-btn"
                >
                  ✉️ Email
                </a>
              )}

            </div>
          )}
        </section>

        {/* RATINGS AND REVIEWS */}
        <section className="profile-section">

          <div className="profile-section-heading">
            <div>
              <h2>Ratings & Reviews</h2>

              <p>
                Feedback from completed KaamON work.
              </p>
            </div>
          </div>

          <div className="profile-rating-summary">

            {ratingData.reviewCount > 0 ? (
              <>
                <strong>
                  ⭐ {ratingData.averageRating}
                </strong>

                <span>
                  {ratingData.reviewCount}{" "}
                  {ratingData.reviewCount === 1
                    ? "Review"
                    : "Reviews"}
                </span>
              </>
            ) : (
              <strong>⭐ New User</strong>
            )}

          </div>

          {ratingData.reviews.length > 0 ? (
            <div className="profile-reviews">

              {ratingData.reviews.map(
                (review) => (
                  <div
                    className="profile-review"
                    key={review.id}
                  >

                    <div className="profile-review-stars">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(
                        5 - review.rating
                      )}
                    </div>

                    {review.comment && (
                      <p>{review.comment}</p>
                    )}

                    <span>
                      — {review.reviewer_name}
                    </span>

                  </div>
                )
              )}

            </div>
          ) : (
            <p className="no-profile-reviews">
              No reviews yet.
            </p>
          )}

        </section>

        {/* SKILLS */}
        <section className="profile-section">

          <div className="profile-section-heading">
            <div>
              <h2>Skills:</h2>
              <p>
                Work this member can do.
              </p>
            </div>
          </div>

          {user.skills ? (
            <div className="profile-skills">

              {user.skills
                .split(",")
                .map((skill) => (
                  <span key={skill.trim()}>
                    {skill.trim()}
                  </span>
                ))}

            </div>
          ) : (
            <p>No skills added yet.</p>
          )}

        </section>

      </div>
    </main>
  );
}

export default UserProfile;