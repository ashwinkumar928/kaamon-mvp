import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import API_URL from "../api";
import "./Profile.css";

function Profile() {
  const token =
    localStorage.getItem("kaamonToken");

  const savedUser =
    localStorage.getItem("kaamonCurrentUser");

  const currentUser = savedUser
    ? JSON.parse(savedUser)
    : null;

  const [profile, setProfile] = useState(null);

  const [editing, setEditing] =
    useState(false);

  const [phone, setPhone] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [skills, setSkills] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [saving, setSaving] =
    useState(false);


  // ==============================
  // LOAD PROFILE
  // ==============================

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(
          `${API_URL}/api/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        setProfile(data);

        setPhone(data.phone || "");
        setLocation(data.location || "");
        setSkills(data.skills || "");

      } catch (error) {
        console.error(
          "Could not load profile:",
          error
        );
      }
    }

    if (token) {
      loadProfile();
    }

  }, [token]);


  // ==============================
  // SAVE PROFILE
  // ==============================

  async function handleSaveProfile() {
    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/profile`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            phone,
            location,
            skills,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Could not update profile."
        );

        return;
      }

      setProfile(data.user);

      setEditing(false);

      setMessage(
        "Profile updated successfully."
      );

    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      setMessage(
        "Could not connect to KaamON server."
      );

    } finally {
      setSaving(false);
    }
  }


  if (!currentUser || !token) {
    return <Navigate to="/login" />;
  }


  const displayUser =
    profile || currentUser;

  const firstLetter =
    displayUser.name
      ?.charAt(0)
      .toUpperCase() || "U";


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

            <h1>
              {displayUser.name}
            </h1>

            <p>
              {displayUser.email}
            </p>

            <span className="profile-member">
              KaamON Member
            </span>

          </div>


          <button
            type="button"
            className="profile-edit-btn"
            onClick={() =>
              setEditing(!editing)
            }
          >
            {editing
              ? "Cancel"
              : "Edit Profile"}
          </button>

        </section>


        {/* EDIT FORM */}

        {editing && (

          <section className="profile-section">

            <div className="profile-section-heading">
              <div>
                <h2>Edit Profile</h2>
                <p>
                  Update your personal information.
                </p>
              </div>
            </div>


            <div className="profile-edit-form">

              <div>
                <label>Phone</label>

                <input
                  type="text"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="Enter phone number"
                />
              </div>


              <div>
                <label>Location</label>

                <input
                  type="text"
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  placeholder="Example: Patna, Bihar"
                />
              </div>


              <div className="skills-input">
                <label>Skills</label>

                <input
                  type="text"
                  value={skills}
                  onChange={(e) =>
                    setSkills(e.target.value)
                  }
                  placeholder="Driver, Shop Helper, Delivery"
                />
              </div>

            </div>


            <button
              type="button"
              className="profile-save-btn"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </section>

        )}


        {/* PERSONAL INFORMATION */}

        <section className="profile-section">

          <div className="profile-section-heading">
            <div>

              <h2>
                Personal Information
              </h2>

              <p>
                Your basic KaamON account details.
              </p>

            </div>
          </div>


          <div className="profile-details">

            <div>
              <span>Full Name</span>

              <strong>
                {displayUser.name}
              </strong>
            </div>


            <div>
              <span>Email Address</span>

              <strong>
                {displayUser.email}
              </strong>
            </div>


            <div>
              <span>Phone</span>

              <strong
                className={
                  !displayUser.phone
                    ? "profile-empty"
                    : ""
                }
              >
                {displayUser.phone ||
                  "Not added yet"}
              </strong>
            </div>


            <div>
              <span>Location</span>

              <strong
                className={
                  !displayUser.location
                    ? "profile-empty"
                    : ""
                }
              >
                {displayUser.location ||
                  "Not added yet"}
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
                Skills help people understand
                what kind of work you can do.
              </p>

            </div>
          </div>


          {displayUser.skills ? (

            <div className="profile-skills">
              {displayUser.skills
                .split(",")
                .map((skill) => (
                  <span key={skill.trim()}>
                    {skill.trim()}
                  </span>
                ))}
            </div>

          ) : (

            <div className="profile-empty-section">

              <span>💼</span>

              <div>

                <strong>
                  No skills added yet
                </strong>

                <p>
                  Add your skills to improve
                  your KaamON profile.
                </p>

              </div>

            </div>

          )}

        </section>


        {message && (
          <p className="profile-message">
            {message}
          </p>
        )}

      </div>

    </main>
  );
}

export default Profile;