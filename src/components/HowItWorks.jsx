import "./HowItWorks.css";

function HowItWorks() {
  return (
    <section id="how" className="how-it-works">
      <div className="how-container">

        <div className="how-heading">
          <span>HOW IT WORKS</span>
          <h2>Simple. Fast. Local.</h2>
          <p>
            One KaamON account lets you post work
            or find nearby work opportunities.
          </p>
        </div>

        <div className="how-steps">

          <div className="how-card">
            <div className="how-number">1</div>
            <h3>Post or Find Work</h3>
            <p>
              Post a short-term job or browse
              nearby opportunities.
            </p>
          </div>

          <div className="how-card">
            <div className="how-number">2</div>
            <h3>Apply or Select</h3>
            <p>
              Apply for work or select the right
              person from your applicants.
            </p>
          </div>

          <div className="how-card">
            <div className="how-number">3</div>
            <h3>Get the Work Done</h3>
            <p>
              Complete the work and manage it
              from your KaamON dashboard.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}

export default HowItWorks;