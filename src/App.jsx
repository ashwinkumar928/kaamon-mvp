import "./App.css";

import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import Stats from "./components/Stats.jsx";
import Categories from "./components/Categories.jsx";
import NearbyJobs from "./components/NearbyJobs.jsx";

import JobDetails from "./pages/JobDetails.jsx";

function App() {
  return (
    <div className="app">

      <Navbar />

      <Routes>

        {/* HOME PAGE */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Stats />
              <Categories />
              <NearbyJobs />
            </>
          }
        />

        {/* JOB DETAILS PAGE */}
        <Route
          path="/jobs/:jobId"
          element={<JobDetails />}
        />

      </Routes>

    </div>
  );
}

export default App;