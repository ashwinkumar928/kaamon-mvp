import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import "./PostWork.css";
import "./InternalPages.css";
import API_URL from "../api";

function PostWork() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(
    localStorage.getItem("kaamonCurrentUser")
  );
  const token = localStorage.getItem("kaamonToken");

  const [formData, setFormData] = useState({
    title: "",
    category: "DRIVER",
    description: "",
    location: "",
    date: "",
    time: "",
    payment: "",
  });

  const [message, setMessage] = useState("");

  if (!currentUser || !token) {
    return <Navigate to="/login" />;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
  event.preventDefault();

  if (
    !formData.title ||
    !formData.description ||
    !formData.location ||
    !formData.date ||
    !formData.time ||
    !formData.payment
  ) {
    setMessage("Please fill all fields.");
    return;
  }

  const newJob = {
  title: formData.title,
  category: formData.category,
  description: formData.description,
  location: formData.location,
  date: formData.date,
  time: formData.time,
  payment: Number(formData.payment),
};

  try {
    const response = await fetch(
      `${API_URL}/api/jobs`,
      {
        method: "POST",

       headers: {
              "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
        body: JSON.stringify(newJob),
      }
    );

    if (!response.ok) {
      throw new Error("Could not post work");
    }

    const savedJob = await response.json();

    console.log("Job saved:", savedJob);

    navigate("/");
  } catch (error) {
    console.error(error);

    setMessage(
      "Could not post work. Please check the backend server."
    );
  }
}

  return (
    <main className="post-work-page karviam-internal">

      <div className="post-work-container">

        <Link className="internal-back" to="/dashboard">&larr; Back to Dashboard</Link>
        <div className="post-work-heading">
          <span>POST WORK</span>

          <h1>Find nearby help</h1>

          <p>
            Tell people what you need and when you need it.
          </p>
        </div>


        <form className="post-work-form" onSubmit={handleSubmit}>
          <fieldset><legend>Work details</legend>
            <div className="form-row">
              <div className="form-group"><label htmlFor="work-category">Category</label><select id="work-category" name="category" value={formData.category} onChange={handleChange}>
                {["Driver", "Painter", "Cook", "Cleaner", "Electrician", "Plumber", "Shop Helper", "Restaurant Helper"].map(category => <option key={category} value={category.toUpperCase()}>{category}</option>)}
              </select></div>
              <div className="form-group"><label htmlFor="work-title">Work title</label><input id="work-title" type="text" name="title" placeholder="Example: Need a driver for one day" value={formData.title} onChange={handleChange} /></div>
            </div>
            <div className="form-group"><label htmlFor="work-description">Description</label><textarea id="work-description" name="description" placeholder="Explain what work needs to be done..." value={formData.description} onChange={handleChange} /></div>
          </fieldset>
          <fieldset><legend>Where &amp; when</legend><div className="form-row work-schedule">
            <div className="form-group"><label htmlFor="work-location">Location</label><input id="work-location" type="text" name="location" placeholder="Example: Patna" value={formData.location} onChange={handleChange} /></div>
            <div className="form-group"><label htmlFor="work-date">Date</label><input id="work-date" type="date" name="date" placeholder="" value={formData.date} onChange={handleChange} /></div>
            <div className="form-group"><label htmlFor="work-time">Time</label><input id="work-time" type="text" name="time" placeholder="Example: 9 AM - 6 PM" value={formData.time} onChange={handleChange} /></div>
          </div></fieldset>
          <fieldset><legend>Payment</legend><div className="form-group"><label htmlFor="work-payment">Payment amount (INR)</label><input id="work-payment" type="number" name="payment" placeholder="Example: 1000" value={formData.payment} onChange={handleChange} /></div></fieldset>
          {message && <p className="post-work-message" role="status">{message}</p>}
          <div className="internal-form-actions"><button type="submit" className="post-work-submit" >Post Work &rarr;</button><Link className="internal-secondary" to="/dashboard">Cancel</Link></div>
        </form>

      </div>

    </main>
  );
}

export default PostWork;