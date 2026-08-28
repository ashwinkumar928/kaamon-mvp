import { Link, Navigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const currentUser = JSON.parse(
    localStorage.getItem("kaamonCurrentUser")
  );

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <main className="dashboard-page">

      <div className="dashboard-container">

        <p className="dashboard-small">
          WELCOME TO KAAMON
        </p>

        <h1>
          Hello, {currentUser.name} 👋
        </h1>

        <p className="dashboard-description">
          What would you like to do today?
        </p>


        <div className="dashboard-actions">

          <div className="dashboard-action-card">

            <div className="dashboard-icon">
              👤
            </div>

            <h2>I Need Someone</h2>

            <p>
              Post your requirement and find people
              available to work nearby.
            </p>

            <Link to="/post-work">
               Post Work →
            </Link>

          </div>


          <div className="dashboard-action-card">

            <div className="dashboard-icon">
              💼
            </div>

            <h2>I Want to Work</h2>

            <p>
              Browse nearby work opportunities and
              apply using the same KaamON account.
            </p>

            <Link to="/#jobs">
              Find Work →
            </Link>

          </div>

        </div>


        <div className="dashboard-info">

          <div>
            <strong>0</strong>
            <span>Jobs Posted</span>
          </div>

          <div>
            <strong>0</strong>
            <span>Applications</span>
          </div>

          <div>
            <strong>0</strong>
            <span>Completed Work</span>
          </div>

        </div>

      </div>

    </main>
  );
}

export default Dashboard;