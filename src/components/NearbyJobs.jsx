import jobs from "../data/jobs";

function NearbyJobs() {
  return (
    <section className="nearby-jobs" id="jobs">

      <div className="section-title">
        <span>WORK NEAR YOU</span>
        <h2>Nearby Opportunities</h2>
        <p>
          Discover short-term work opportunities available around you.
        </p>
      </div>

      <div className="jobs-grid">

        {jobs.map((job) => (
          <div className="nearby-job-card" key={job.id}>

            <div className="nearby-job-top">
              <div className="nearby-job-icon">
                {job.icon}
              </div>

              <div>
                <span className="job-type">
                  {job.category}
                </span>

                <h3>{job.title}</h3>
              </div>
            </div>

            <p className="nearby-job-description">
              {job.description}
            </p>

            <div className="job-details-row">
              <span>📍 {job.location}</span>
              <span>📅 {job.date}</span>
            </div>

            <div className="job-details-row">
              <span>🕘 {job.time}</span>
              <span>📏 {job.distance}</span>
            </div>

            <div className="job-bottom">
              <strong>{job.payment}</strong>
              <button>View Work →</button>
            </div>

          </div>
        ))}

      </div>

      <div className="view-all-jobs">
        <button>View All Work Opportunities →</button>
      </div>

    </section>
  );
}

export default NearbyJobs;