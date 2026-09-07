import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import API_URL from "../api";
import "./PostWork.css";

function EditWork() {
  const { jobId } = useParams();

  const navigate = useNavigate();

  const token =
    localStorage.getItem("kaamonToken");

  const [formData, setFormData] =
    useState({
      title: "",
      category: "DRIVER",
      description: "",
      location: "",
      date: "",
      time: "",
      payment: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");


  // ==============================
  // LOAD EXISTING JOB
  // ==============================

  useEffect(() => {
    async function loadJob() {
      try {
        const response = await fetch(
          `${API_URL}/api/my-jobs/${jobId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          setMessage(
            data.message ||
              "Could not load this work."
          );

          return;
        }

        setFormData({
          title: data.title || "",
          category:
            data.category || "DRIVER",
          description:
            data.description || "",
          location:
            data.location || "",
          date: data.date
            ? String(data.date).split("T")[0]
            : "",
          time: data.time || "",
          payment:
            data.payment || "",
        });

      } catch (error) {
        console.error(
          "Load work error:",
          error
        );

        setMessage(
          "Could not connect to KaamON server."
        );

      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadJob();
    } else {
      setLoading(false);
    }

  }, [jobId, token]);


  // ==============================
  // HANDLE FORM CHANGE
  // ==============================

  function handleChange(event) {
    const { name, value } =
      event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }


  // ==============================
  // SAVE CHANGES
  // ==============================

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !formData.title ||
      !formData.category ||
      !formData.description ||
      !formData.location ||
      !formData.date ||
      !formData.time ||
      !formData.payment
    ) {
      setMessage(
        "Please fill all fields."
      );

      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/my-jobs/${jobId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: formData.title,
            category:
              formData.category,
            description:
              formData.description,
            location:
              formData.location,
            date: formData.date,
            time: formData.time,
            payment:
              Number(formData.payment),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Could not update work."
        );

        return;
      }

      navigate("/my-jobs");

    } catch (error) {
      console.error(
        "Update work error:",
        error
      );

      setMessage(
        "Could not connect to KaamON server."
      );

    } finally {
      setSaving(false);
    }
  }


  // ==============================
  // AUTH
  // ==============================

  if (!token) {
    return <Navigate to="/login" />;
  }


  if (loading) {
    return (
      <main className="post-work-page">

        <div className="post-work-container">

          <h2>
            Loading work...
          </h2>

        </div>

      </main>
    );
  }


  return (
    <main className="post-work-page">

      <div className="post-work-container">

        <div className="post-work-heading">

          <span>
            EDIT WORK
          </span>

          <h1>
            Update your work post
          </h1>

          <p>
            Make changes to your work
            requirement.
          </p>

        </div>


        <form
          className="post-work-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label>
              Work Title
            </label>

            <input
              type="text"
              name="title"
              placeholder="Example: Need a driver for one day"
              value={formData.title}
              onChange={handleChange}
            />

          </div>


          <div className="form-group">

            <label>
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >

              <option value="DRIVER">
                Driver
              </option>

              <option value="PAINTER">
                Painter
              </option>

              <option value="COOK">
                Cook
              </option>

              <option value="CLEANER">
                Cleaner
              </option>

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

            <label>
              Description
            </label>

            <textarea
              name="description"
              placeholder="Explain what work needs to be done..."
              value={
                formData.description
              }
              onChange={handleChange}
            />

          </div>


          <div className="form-row">

            <div className="form-group">

              <label>
                Location
              </label>

              <input
                type="text"
                name="location"
                placeholder="Example: Patna"
                value={
                  formData.location
                }
                onChange={handleChange}
              />

            </div>


            <div className="form-group">

              <label>
                Date
              </label>

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

              <label>
                Time
              </label>

              <input
                type="text"
                name="time"
                placeholder="Example: 9 AM - 6 PM"
                value={formData.time}
                onChange={handleChange}
              />

            </div>


            <div className="form-group">

              <label>
                Payment (₹)
              </label>

              <input
                type="number"
                name="payment"
                placeholder="Example: 1000"
                value={
                  formData.payment
                }
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
            disabled={saving}
          >

            {saving
              ? "Saving..."
              : "Save Changes →"}

          </button>

        </form>

      </div>

    </main>
  );
}

export default EditWork;