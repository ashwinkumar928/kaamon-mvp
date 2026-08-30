import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "./PostWork.css";
import API_URL from "../api";

function PostWork() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(
    localStorage.getItem("kaamonCurrentUser")
  );

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

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const categoryIcons = {
    DRIVER: "🚗",
    PAINTER: "🎨",
    COOK: "🍳",
    CLEANER: "🧹",
    ELECTRICIAN: "⚡",
    PLUMBER: "🔧",
    "SHOP HELPER": "🏪",
    "RESTAURANT HELPER": "🍽️",
  };

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

    postedBy: {
      id: currentUser.id,
      name: currentUser.name,
    },
  };

  try {
    const response = await fetch(
      `${API_URL}/api/jobs`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
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
    <main className="post-work-page">

      <div className="post-work-container">

        <div className="post-work-heading">
          <span>POST WORK</span>

          <h1>What help do you need?</h1>

          <p>
            Share your requirement and let nearby people apply.
          </p>
        </div>


        <form
          className="post-work-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">
            <label>Work Title</label>

            <input
              type="text"
              name="title"
              placeholder="Example: Need a driver for one day"
              value={formData.title}
              onChange={handleChange}
            />
          </div>


          <div className="form-group">
            <label>Category</label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="DRIVER">Driver</option>

              <option value="PAINTER">Painter</option>

              <option value="COOK">Cook</option>

              <option value="CLEANER">Cleaner</option>

              <option value="ELECTRICIAN">
                Electrician
              </option>

              <option value="PLUMBER">
                Plumber
              </option>

              <option value="SHOP HELPER">
                Shop Helper
              </option>

              <option value="RESTAURANT HELPER">
                Restaurant Helper
              </option>
            </select>
          </div>


          <div className="form-group full-width">
            <label>Description</label>

            <textarea
              name="description"
              placeholder="Explain what work needs to be done..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>


          <div className="form-row">

            <div className="form-group">
              <label>Location</label>

              <input
                type="text"
                name="location"
                placeholder="Example: Patna"
                value={formData.location}
                onChange={handleChange}
              />
            </div>


            <div className="form-group">
              <label>Date</label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

          </div>


          <div className="form-row">

            <div className="form-group">
              <label>Time</label>

              <input
                type="text"
                name="time"
                placeholder="Example: 9 AM - 6 PM"
                value={formData.time}
                onChange={handleChange}
              />
            </div>


            <div className="form-group">
              <label>Payment (₹)</label>

              <input
                type="number"
                name="payment"
                placeholder="Example: 1000"
                value={formData.payment}
                onChange={handleChange}
              />
            </div>

          </div>


          {message && (
            <p className="post-work-message">
              {message}
            </p>
          )}


          <button
            type="submit"
            className="post-work-submit"
          >
            Post Work →
          </button>

        </form>

      </div>

    </main>
  );
}

export default PostWork;