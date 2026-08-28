import { useState } from "react";
import { Link } from "react-router-dom";
import jobs from "../data/jobs";
import "./NearbyJobs.css";

function NearbyJobs() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = ["ALL", "DRIVER", "SHOP HELPER", "PAINTER"];

  const filteredJobs = jobs.filter((job) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      job.title.toLowerCase().includes(searchText) ||
      job.category.toLowerCase().includes(searchText) ||
      job.location.toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "ALL" ||
      job.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="nearby-jobs" id="jobs">

      <div className="section-title">
        <span>WORK NEAR YOU</span>
        <h2>Nearby Opportunities</h2>
        <p>
          Find short-term work opportunities available around you.
        </p>
      </div>

      {/* SEARCH + FILTER */}
      <div className="job-toolbar">

        <div className="job-search-box">
          <span className="search-icon">🔍</span>

          <input
            type="text"
            placeholder="Search work or location..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-row">

          <div className="job-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={
                  selectedCategory === category
                    ? "filter-btn active-filter"
                    : "filter-btn"
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category === "ALL" ? "All Work" : category}
              </button>
            ))}
          </div>

          <div className="results-count">
            {filteredJobs.length} opportunities
          </div>

        </div>

      </div>

      {/* JOB CARDS */}
      <div className="jobs-grid">

        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (

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
                <Link
                    to={`/jobs/${job.id}`}
                    className="view-work-btn"
                >
                   View Work →
                </Link>
              </div>

            </div>

          ))
        ) : (

          <div className="no-jobs">
            <h3>No opportunities found</h3>
            <p>Try another work type or location.</p>
          </div>

        )}

      </div>

    </section>
  );
}

export default NearbyJobs;