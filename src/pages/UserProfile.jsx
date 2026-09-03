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
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
          setMessage(data.message || "Could not load profile.");
          return;
        }

        setUser(data);
      } catch (error) {
        console.error("User profile error:", error);
        setMessage("Could not connect to KaamON server.");
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <p>{message}</p>
          <Link to="/dashboard">← Back to Dashboard</Link>
        </div>
      </main>
    );
  }

  const firstLetter = user.name?.charAt(0).toUpperCase() || "U";

  return (
    <main className="profile-page">
      <div className="profile-container">
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

        <section className="profile-header">
          <div className="profile-avatar">{firstLetter}</div>

          <div className="profile-main-info">
            <h1>{user.name}</h1>
            <p>{user.email}</p>
            <span className="profile-member">KaamON Worker</span>
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-section-heading">
            <div>
              <h2>Worker Information</h2>
              <p>Details shared by this KaamON member.</p>
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
              <strong>{user.location || "Not added yet"}</strong>
            </div>
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-section-heading">
            <div>
              <h2>Skills:</h2>
              <p>Work this member can do.</p>
            </div>
          </div>

          {user.skills ? (
            <div className="profile-skills">
              {user.skills.split(",").map((skill) => (
                <span key={skill.trim()}>{skill.trim()}</span>
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