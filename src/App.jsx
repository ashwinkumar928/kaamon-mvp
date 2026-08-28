import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats.jsx";
import Categories from "./components/Categories";
import NearbyJobs from "./components/NearbyJobs";

function App() {
  return (
    <div className="app">

      <Navbar />

       <Hero />

    {/* STATS */}
<section className="stats">

  <div>
    <strong>Local</strong>
    <span>Nearby opportunities</span>
  </div>

  <div>
    <strong>Flexible</strong>
    <span>Hourly & daily work</span>
  </div>

  <div>
    <strong>Two-Way</strong>
    <span>Hire & work</span>
  </div>

  <div>
    <strong>Trusted</strong>
    <span>Profiles & reviews</span>
  </div>

</section>

<Categories />

<NearbyJobs />

</div>
);
}

export default App;