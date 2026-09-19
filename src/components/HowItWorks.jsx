import "./HowItWorks.css";

function HowItWorks() {
  return (
    <section id="how" className="how-it-works">
      <div className="how-container">

        <div className="how-heading">
          <span>HOW IT WORKS</span>

          <h2>
            Simple. Fast. Local.
          </h2>

          <p>
            One Karviam account lets you post work
            or find nearby work opportunities.
          </p>
        </div>


        <div className="how-steps">

          <div className="how-card">

            <div className="how-card-top">
              <div className="how-icon">
                📢
              </div>

              <div className="how-number">
                01
              </div>
            </div>

            <h3>
              Post or Find Work
            </h3>

            <p>
              Post a short-term job or browse
              nearby opportunities that match
              what you need.
            </p>

            <div className="how-card-bottom">
              <span>Start nearby</span>
              <span>→</span>
            </div>

          </div>


          <div className="how-card featured">

            <div className="how-card-top">

              <div className="how-icon">
                🤝
              </div>

              <div className="how-number">
                02
              </div>

            </div>

            <h3>
              Apply or Select
            </h3>

            <p>
              Apply for work or choose the right
              person from the people who applied.
            </p>

            <div className="how-card-bottom">
              <span>Connect easily</span>
              <span>→</span>
            </div>

          </div>


          <div className="how-card">

            <div className="how-card-top">

              <div className="how-icon">
                ✅
              </div>

              <div className="how-number">
                03
              </div>

            </div>

            <h3>
              Get the Work Done
            </h3>

            <p>
              Complete the work and manage the
              whole process from your Karviam
              dashboard.
            </p>

            <div className="how-card-bottom">
              <span>Complete safely</span>
              <span>→</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default HowItWorks;