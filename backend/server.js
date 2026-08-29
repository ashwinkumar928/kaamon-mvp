require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// ==============================
// HOME
// ==============================

app.get("/", (req, res) => {
  res.send("KaamON Backend is running 🚀");
});


// ==============================
// TEST DATABASE CONNECTION
// ==============================

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "KaamON database connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});


// ==============================
// GET ALL JOBS
// ==============================

app.get("/api/jobs", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM jobs
      ORDER BY created_at DESC
    `);

    const jobs = result.rows.map((job) => ({
      id: job.id,
      icon: job.icon,
      category: job.category,
      title: job.title,
      description: job.description,
      location: job.location,
      date: job.work_date,
      time: job.work_time,
      distance: job.distance,
      payment: job.payment,

      postedBy: {
        id: job.posted_by_id,
        name: job.posted_by_name,
      },
    }));

    res.json(jobs);

  } catch (error) {
    console.error("Get jobs error:", error);

    res.status(500).json({
      message: "Could not load jobs",
    });
  }
});


// ==============================
// GET ONE JOB
// ==============================

app.get("/api/jobs/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM jobs
      WHERE id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const job = result.rows[0];

    res.json({
      id: job.id,
      icon: job.icon,
      category: job.category,
      title: job.title,
      description: job.description,
      location: job.location,
      date: job.work_date,
      time: job.work_time,
      distance: job.distance,
      payment: job.payment,

      postedBy: {
        id: job.posted_by_id,
        name: job.posted_by_name,
      },
    });

  } catch (error) {
    console.error("Get job error:", error);

    res.status(500).json({
      message: "Could not load job",
    });
  }
});


// ==============================
// POST NEW JOB
// ==============================

app.post("/api/jobs", async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      location,
      date,
      time,
      payment,
      postedBy,
    } = req.body;


    if (
      !title ||
      !category ||
      !description ||
      !location ||
      !date ||
      !time ||
      !payment
    ) {
      return res.status(400).json({
        message: "Please provide all required fields.",
      });
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


    const icon =
      categoryIcons[category] || "💼";


    const result = await pool.query(
      `
      INSERT INTO jobs
      (
        category,
        title,
        description,
        location,
        work_date,
        work_time,
        distance,
        payment,
        icon,
        posted_by_id,
        posted_by_name
      )

      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)

      RETURNING *
      `,
      [
        category,
        title,
        description,
        location,
        date,
        time,
        "Nearby",
        Number(payment),
        icon,
        postedBy?.id || null,
        postedBy?.name || null,
      ]
    );


    const savedJob = result.rows[0];


    res.status(201).json({
      id: savedJob.id,
      icon: savedJob.icon,
      category: savedJob.category,
      title: savedJob.title,
      description: savedJob.description,
      location: savedJob.location,
      date: savedJob.work_date,
      time: savedJob.work_time,
      distance: savedJob.distance,
      payment: savedJob.payment,

      postedBy: {
        id: savedJob.posted_by_id,
        name: savedJob.posted_by_name,
      },
    });

  } catch (error) {
    console.error("Post job error:", error);

    res.status(500).json({
      message: "Could not post work",
    });
  }
});


// ==============================
// START SERVER
// ==============================

app.listen(PORT, () => {
  console.log(
    `KaamON backend running on http://localhost:${PORT}`
  );
});