require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Please login first.",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Invalid login token.",
    });
  }

  try {
    const user = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = user;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Session expired. Please login again.",
    });
  }
}


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
// REGISTER USER
// ==============================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "User already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users
      (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at
      `,
      [
        name,
        email.toLowerCase(),
        hashedPassword,
      ]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: "Account created successfully",
      user,
    });

  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      message: "Could not create account.",
    });
  }
});

// ==============================
// LOGIN USER
// ==============================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password.",
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Could not login.",
    });
  }
});

app.post(
  "/api/jobs/:id/apply",
  authenticateToken,
  async (req, res) => {
    try {
      const jobId = req.params.id;
      const applicantId = req.user.id;

      const jobResult = await pool.query(
        "SELECT * FROM jobs WHERE id = $1",
        [jobId]
      );

      if (jobResult.rows.length === 0) {
        return res.status(404).json({
          message: "Job not found.",
        });
      }

      const job = jobResult.rows[0];

      if (
        String(job.posted_by_id) ===
        String(applicantId)
      ) {
        return res.status(400).json({
          message: "You cannot apply to your own job.",
        });
      }

      const existingApplication =
        await pool.query(
          `
          SELECT id
          FROM applications
          WHERE job_id = $1
          AND applicant_id = $2
          `,
          [jobId, applicantId]
        );

      if (existingApplication.rows.length > 0) {
        return res.status(409).json({
          message: "You already applied for this job.",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO applications
        (
          job_id,
          applicant_id,
          status
        )
        VALUES ($1, $2, 'pending')
        RETURNING *
        `,
        [jobId, applicantId]
      );

      res.status(201).json({
        message: "Application sent successfully.",
        application: result.rows[0],
      });

    } catch (error) {
      console.error("Apply job error:", error);

      res.status(500).json({
        message: "Could not send application.",
      });
    }
  }
);

// ==============================
// GET MY POSTED JOBS
// ==============================

app.get(
  "/api/my-jobs",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const result = await pool.query(
        `
        SELECT
          jobs.*,
          COUNT(applications.id)::int AS applicant_count
        FROM jobs

        LEFT JOIN applications
          ON applications.job_id = jobs.id

        WHERE jobs.posted_by_id = $1::text

        GROUP BY jobs.id

        ORDER BY jobs.created_at DESC
        `,
        [userId]
      );

      res.json(result.rows);

    } catch (error) {
      console.error("My jobs error:", error);

      res.status(500).json({
        message: "Could not load your jobs.",
      });
    }
  }
);

// ==============================
// VIEW APPLICANTS FOR A JOB
// ==============================

app.get(
  "/api/jobs/:id/applicants",
  authenticateToken,
  async (req, res) => {
    try {
      const jobId = req.params.id;
      const userId = req.user.id;

      // Check job belongs to logged-in user
      const jobResult = await pool.query(
        `
        SELECT *
        FROM jobs
        WHERE id = $1
        `,
        [jobId]
      );

      if (jobResult.rows.length === 0) {
        return res.status(404).json({
          message: "Job not found.",
        });
      }

      const job = jobResult.rows[0];

      if (
        String(job.posted_by_id) !==
        String(userId)
      ) {
        return res.status(403).json({
          message:
            "You cannot view applicants for this job.",
        });
      }

      const result = await pool.query(
        `
        SELECT
          applications.id AS application_id,
          applications.status,
          applications.created_at,

          users.id AS applicant_id,
          users.name,
          users.email

        FROM applications

        JOIN users
          ON users.id = applications.applicant_id

        WHERE applications.job_id = $1

        ORDER BY applications.created_at DESC
        `,
        [jobId]
      );

      res.json(result.rows);

    } catch (error) {
      console.error(
        "Applicants error:",
        error
      );

      res.status(500).json({
        message:
          "Could not load applicants.",
      });
    }
  }
);
 // ==============================
// ACCEPT / REJECT APPLICATION
// ==============================

app.patch(
  "/api/applications/:id/status",
  authenticateToken,
  async (req, res) => {
    try {
      const applicationId = req.params.id;
      const userId = req.user.id;
      const { status } = req.body;

      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({
          message: "Invalid application status.",
        });
      }

      // Find application and its job
      const applicationResult = await pool.query(
        `
        SELECT
          applications.*,
          jobs.posted_by_id
        FROM applications

        JOIN jobs
          ON jobs.id = applications.job_id

        WHERE applications.id = $1
        `,
        [applicationId]
      );

      if (applicationResult.rows.length === 0) {
        return res.status(404).json({
          message: "Application not found.",
        });
      }

      const application =
        applicationResult.rows[0];

      // Only job owner can accept/reject
      if (
        String(application.posted_by_id) !==
        String(userId)
      ) {
        return res.status(403).json({
          message:
            "You cannot update this application.",
        });
      }

      const result = await pool.query(
        `
        UPDATE applications

        SET status = $1

        WHERE id = $2

        RETURNING *
        `,
        [status, applicationId]
      );

      res.json({
        message: `Application ${status} successfully.`,
        application: result.rows[0],
      });

    } catch (error) {
      console.error(
        "Update application error:",
        error
      );

      res.status(500).json({
        message:
          "Could not update application.",
      });
    }
  }
);

// ==============================
// START SERVER
// ==============================

app.listen(PORT, () => {
  console.log(
    `KaamON backend running on http://localhost:${PORT}`
  );
});