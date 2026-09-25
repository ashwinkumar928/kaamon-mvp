import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import API_URL from "../api";
import categories from "../data/categories";
import { MIN_PAYMENT, MAX_PAYMENT, PAYMENT_HELP, getPaymentError } from "../utils/paymentValidation";
import "./PostWork.css";
import "./InternalPages.css";

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
          "Could not connect to Karviam server."
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

    const paymentError = getPaymentError(formData.payment);
    if (paymentError) {
      setMessage(paymentError);
      return;
    }

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
        "Could not connect to Karviam server."
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
      <main className="post-work-page karviam-internal">

        <div className="post-work-container">

          <h2>
            Loading work...
          </h2>

        </div>

      </main>
    );
  }


  return (
    <main className="post-work-page karviam-internal">

      <div className="post-work-container">

        <Link className="internal-back" to="/dashboard">&larr; Back to Dashboard</Link>
        <div className="post-work-heading">

          <span>
            EDIT WORK
          </span>

          <h1>
            Update your requirement
          </h1>

          <p>
            Make changes to your work
            requirement.
          </p>

        </div>


        <form className="post-work-form" onSubmit={handleSubmit}>
          <fieldset><legend>Work details</legend>
            <div className="form-row">
              <div className="form-group"><label htmlFor="work-category">Category</label><select id="work-category" name="category" value={formData.category} onChange={handleChange}>
                {categories.map(category => <option key={category.id} value={category.name.toUpperCase()}>{category.name}</option>)}
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
          <fieldset><legend>Payment</legend><div className="form-group">
            <label htmlFor="work-payment">Payment amount (INR)</label>
            <input id="work-payment" type="number" name="payment" min={MIN_PAYMENT} max={MAX_PAYMENT} step="1" required
              placeholder="Example: 1000" value={formData.payment} onChange={handleChange}
              aria-describedby="work-payment-help"
              onInvalid={(event) => event.target.setCustomValidity(getPaymentError(event.target.value))}
              onInput={(event) => event.target.setCustomValidity("")} />
            <small id="work-payment-help">{PAYMENT_HELP}</small>
          </div></fieldset>
          {message && <p className="post-work-message" role="status">{message}</p>}
          <div className="internal-form-actions"><button type="submit" className="post-work-submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button><Link className="internal-secondary" to="/my-jobs">Cancel</Link></div>
        </form>

      </div>

    </main>
  );
}

export default EditWork;
