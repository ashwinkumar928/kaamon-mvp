import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./NearbyJobs.css";
import API_URL from "../api";

function NearbyJobs({ filters, onFiltersChange } = {}) {
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [localFilters, setLocalFilters] = useState({ location: "", search: "", category: "ALL" });
  const { location, search, category: selectedCategory } = filters ?? localFilters;
  const setFilters = onFiltersChange ?? setLocalFilters;
  function formatJobDate(dateValue) {
  if (!dateValue) return "";

  return String(dateValue).split("T")[0];
}

 useEffect(() => {
  async function loadJobs() {
    try {
      setLoadError("");

      const response = await fetch(
        `${API_URL}/api/jobs`
      );

      const data = await response.json();

      if (!response.ok) {
        setAllJobs([]);
        setLoadError(
          data.message ||
            "Could not load work opportunities."
        );
        return;
      }

      if (!Array.isArray(data)) {
        setAllJobs([]);
        setLoadError(
          "Could not load work opportunities."
        );
        return;
      }

      setAllJobs(data);

    } catch (error) {
      console.error(
        "Could not load jobs:",
        error
      );

      setAllJobs([]);

      setLoadError(
        "Could not connect to Karviam server."
      );
    } finally {
      setLoading(false);
    }
  }

  loadJobs();
}, []);

  const categories = [
    "ALL",
    ...(selectedCategory !== "ALL" ? [selectedCategory] : []),
    ...new Set(
      allJobs.map((job) => job.category)
    ),
  ].filter((category, index, values) => values.indexOf(category) === index);

  const filteredJobs = allJobs.filter((job) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      String(job.title ?? "").toLowerCase().includes(searchText) ||
      String(job.category ?? "").toLowerCase().includes(searchText) ||
      String(job.location ?? "").toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "ALL" ||
      String(job.category ?? "").toUpperCase() === selectedCategory.toUpperCase();

    const matchesLocation = String(job.location ?? "").toLowerCase().includes(location.trim().toLowerCase());

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <section className="nearby-jobs" id="jobs" aria-busy={loading}>

      <div className="section-title">
        <span>WORK NEAR YOU</span>
        <h2>Nearby Opportunities</h2>
        <p>
          Find short-term work opportunities available around you.
        </p>
      </div>

      {/* SEARCH + FILTER */}
      <div className="job-toolbar">

        {(location || search || selectedCategory !== "ALL") && (
          <div className="nearby-active-filters">
            <p>{location ? `Area: ${location}` : "All areas"}{selectedCategory !== "ALL" ? ` · ${selectedCategory}` : ""}</p>
            <button type="button" onClick={() => setFilters({ location: "", search: "", category: "ALL" })}>Clear all filters</button>
          </div>
        )}

        <div className="job-search-box">
          <span className="search-icon">🔍</span>

          <input
            type="text"
            placeholder="Search work or location..."
            aria-label="Search jobs by work or location"
            value={search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          />

          {search && (
            <button
              className="clear-search"
              aria-label="Clear search"
              onClick={() => setFilters((current) => ({ ...current, search: "" }))}
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
                aria-pressed={selectedCategory === category}
                onClick={() => setFilters((current) => ({
                  ...current,
                  category,
                  search: current.search.trim().toUpperCase() === current.category ? "" : current.search,
                }))}
              >
                {category === "ALL" ? "All Work" : category}
              </button>
            ))}
          </div>

          <div className="results-count">
            {loading ? "Loading opportunities…" : `${filteredJobs.length} opportunities`}
          </div>

        </div>

      </div>

      {/* JOB CARDS */}
      <div className="jobs-grid">

        {loading && <div className="no-jobs" role="status"><h3>Loading opportunities…</h3></div>}

        {loadError && (
          <div className="no-jobs">
          <h3>Could not load opportunities</h3>
          <p>{loadError}</p>
        </div>
      )}

        {!loading && !loadError && filteredJobs.length > 0 ? (
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
                <span>📅 {formatJobDate(job.date)}</span>
              </div>

              <div className="job-details-row">
                <span>🕘 {job.time}</span>
                <span>📏 {job.distance}</span>
              </div>

              <div className="job-bottom">
                <div className="nearby-job-payment">
                  <small>Payment</small>
                <strong>
                     ₹{Number(job.payment).toLocaleString("en-IN")}
                </strong>
                </div>
                <Link
                    to={`/jobs/${job.id}`}
                    className="view-work-btn"
                >
                   View Work →
                </Link>
              </div>

            </div>

          ))
        ) : !loading && !loadError ? (

  <div className="no-jobs">
    <h3>No nearby opportunities match your search yet.</h3>
    <p>Try another work type or location.</p>
  </div>

) : null}

      </div>

    </section>
  );
}

export default NearbyJobs;
