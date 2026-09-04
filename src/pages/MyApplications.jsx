import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import API_URL from "../api";
import "./MyApplications.css";

function MyApplications() {
  const token = localStorage.getItem("kaamonToken");

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    async function loadApplications() {
      try {
        const response = await fetch(
          `${API_URL}/api/my-applications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Could not load your applications."
          );
          return;
        }

        setApplications(data);

      } catch (error) {
        console.error(
          "My applications error:",
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
      loadApplications();
    } else {
      setLoading(false);
    }

  }, [token]);


  if (!token) {
    return <Navigate to="/login" />;
  }


  if (loading) {
    return (
      <main className="my-applications-page">
        <div className="my-applications-container">
          <h2>Loading your applications...</h2>
        </div>
      </main>
    );
  }


  return (
    <main className="my-applications-page">

      <div className="my-applications-container">

        <Link
          to="/dashboard"
          className="my-applications-back"
        >
          ← Back to Dashboard
        </Link>


        <div className="my-applications-heading">

          <span>YOUR APPLICATIONS</span>

          <h1>My Applications</h1>

          <p>
            Track the work opportunities you have applied for.
          </p>

        </div>


        {error && (
          <p className="my-applications-error">
            {error}
          </p>
        )}


        {!error &&
          applications.length === 0 && (
            <div className="no-applications">

              <h2>No applications yet</h2>

              <p>
                Find work opportunities and apply for them.
              </p>

              <Link to="/">
                Find Work →
              </Link>

            </div>
          )}


        <div className="applications-list">

          {applications.map((application) => (

            <div
              className="application-card"
              key={application.application_id}
            >

              <div className="application-main">

                <div className="application-icon">
                  {application.icon || "💼"}
                </div>


                <div>

                  <span className="application-category">
                    {application.category}
                  </span>

                  <h2>
                    {application.title}
                  </h2>

                  <p>
                    📍 {application.location}
                  </p>

                </div>

              </div>


              <div className="application-info">

                <div>
                  <small>Payment</small>

                  <strong>
                    ₹
                    {Number(
                      application.payment
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>


                <div className="application-status-area">

                  <small>Status</small>

                  <span
                    className={`application-status status-${application.status}`}
                  >
                    {application.status}
                  </span>

                </div>

              </div>

              {application.status === "accepted" ||
               application.status === "completed" ? (
                   <div className="hirer-contact">
                 <h3>Contact Hirer</h3>

              <p>
                  <strong>Name:</strong>{" "}
                  {application.posted_by_name || "Not available"}
              </p>

               <p>
                  <strong>Phone:</strong>{" "}
                  {application.poster_phone || "Not added yet"}
              </p>

              <p>
                 <strong>Email:</strong>{" "}
                 {application.poster_email || "Not added yet"}
              </p>
            </div>
              ) : (
              <div className="hirer-contact locked-contact">
              <p>
                🔒 Contact details will be available after your
                application is accepted.
            </p>
        </div>
      )}

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}

export default MyApplications;