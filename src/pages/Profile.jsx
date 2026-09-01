import { Link, Navigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const savedUser =
    localStorage.getItem("kaamonCurrentUser");

  const currentUser = savedUser
    ? JSON.parse(savedUser)
    : null;

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const firstLetter =
    currentUser.name?.charAt(0).toUpperCase() || "U";

  return (
    <main className="profile-page">
      <div className="profile-container">

        <Link
          to="/dashboard"
          className="profile-back"
        >
          ← Back to Dashboard
        </Link>

        {/* PROFILE HEADER */}

        <section className="profile-header">

          <div className="profile-avatar">
            {firstLetter}
          </div>

          <div className="profile-main-info">

            <h1>{currentUser.name}</h1>

            <p>{currentUser.email}</p>

            <span className="profile-member">
              KaamON Member
            </span>

          </div>

          <button
            type="button"
            className="profile-edit-btn"
          >
            Edit Profile
          </button>

        </section>


        {/* PERSONAL INFORMATION */}

        <section className="profile-section">

          <div className="profile-section-heading">
            <div>
              <h2>Personal Information</h2>
              <p>
                Your basic KaamON account details.
              </p>
            </div>
          </div>

          <div className="profile-details">

            <div>
              <span>Full Name</span>
              <strong>{currentUser.name}</strong>
            </div>

            <div>
              <span>Email Address</span>
              <strong>{currentUser.email}</strong>
            </div>

            <div>
              <span>Phone</span>
              <strong className="profile-empty">
                Not added yet
              </strong>
            </div>

            <div>
              <span>Location</span>
              <strong className="profile-empty">
                Not added yet
              </strong>
            </div>

          </div>

        </section>


        {/* SKILLS */}

        <section className="profile-section">

          <div className="profile-section-heading">
            <div>
              <h2>Skills</h2>
              <p>
                Skills help people understand what
                kind of work you can do.
              </p>
            </div>
          </div>

          <div className="profile-empty-section">
            <span>💼</span>

            <div>
              <strong>No skills added yet</strong>
              <p>
                Add your skills to improve your
                KaamON profile.
              </p>
            </div>
          </div>

        </section>

      </div>
    </main>
  );
}

export default Profile;