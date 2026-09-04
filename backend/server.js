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
  SELECT jobs.*
  FROM jobs

  WHERE jobs.work_date >= CURRENT_DATE

  AND NOT EXISTS (
    SELECT 1
    FROM applications
    WHERE applications.job_id = jobs.id
    AND applications.status IN ('accepted', 'completed')
  )

  ORDER BY jobs.created_at DESC
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

app.post(
  "/api/jobs",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        title,
        category,
        description,
        location,
        date,
        time,
        payment,
      } = req.body;

      const userId = req.user.id;

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

      const userResult = await pool.query(
        `
        SELECT id, name
        FROM users
        WHERE id = $1
        `,
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      const user = userResult.rows[0];

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

      const icon = categoryIcons[category] || "💼";

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
          user.id,
          user.name,
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
  }
);
   
      
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

const filledResult = await pool.query(
  `
  SELECT id
  FROM applications
  WHERE job_id = $1
  AND status IN ('accepted', 'completed')
  `,
  [jobId]
);

if (filledResult.rows.length > 0) {
  return res.status(409).json({
    message: "This job is no longer available.",
  });
}

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

    COUNT(applications.id)::int AS applicant_count,

    CASE
      WHEN COUNT(applications.id)
        FILTER (
          WHERE applications.status = 'completed'
        ) > 0
      THEN 'completed'

      WHEN COUNT(applications.id)
        FILTER (
          WHERE applications.status = 'accepted'
        ) > 0
      THEN 'filled'

      ELSE 'available'
    END AS job_status

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

          CASE
            WHEN applications.status IN ('accepted', 'completed')
            THEN users.email
            ELSE NULL
            END AS email

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

     if (
       !["accepted", "rejected", "completed"].includes(status)
    ) {
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

        if (
     status === "completed" && application.status !== "accepted"
     ) {
         return res.status(400).json({
         message:
         "Only accepted work can be marked as completed.",
       });
    }

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
// GET MY APPLICATIONS
// ==============================

app.get(
  "/api/my-applications",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;

      console.log(
        "My applications user ID:",
        userId
      );

      const result = await pool.query(
  `
  SELECT
    applications.id AS application_id,
    applications.status,
    applications.created_at,

    jobs.id AS job_id,
    jobs.title,
    jobs.category,
    jobs.description,
    jobs.location,
    jobs.work_date,
    jobs.work_time,
    jobs.payment,
    jobs.icon,

    jobs.posted_by_id,
    jobs.posted_by_name,

    CASE
      WHEN applications.status IN ('accepted', 'completed')
      THEN poster.email
      ELSE NULL
    END AS poster_email,

    CASE
      WHEN applications.status IN ('accepted', 'completed')
      THEN poster.phone
      ELSE NULL
    END AS poster_phone

  FROM applications

  JOIN jobs
    ON jobs.id = applications.job_id

  LEFT JOIN users AS poster
    ON poster.id::text = jobs.posted_by_id

  WHERE applications.applicant_id = $1

  ORDER BY applications.created_at DESC
  `,
  [userId]
);

      console.log(
        "Applications found:",
        result.rows.length
      );

      res.json(result.rows);

    } catch (error) {
      console.error(
        "My applications error:",
        error
      );

      res.status(500).json({
        message:
          "Could not load your applications.",
      });
    }
  }
);

// ==============================
// CHECK MY APPLICATION FOR A JOB
// ==============================

app.get(
  "/api/jobs/:id/my-application",
  authenticateToken,
  async (req, res) => {
    try {
      const jobId = req.params.id;
      const userId = req.user.id;

      const result = await pool.query(
        `
        SELECT
          id AS application_id,
          status
        FROM applications
        WHERE job_id = $1
        AND applicant_id = $2
        `,
        [jobId, userId]
      );

      if (result.rows.length === 0) {
        return res.json({
          applied: false,
        });
      }

      res.json({
        applied: true,
        application: result.rows[0],
      });

    } catch (error) {
      console.error(
        "Check application error:",
        error
      );

      res.status(500).json({
        message:
          "Could not check application.",
      });
    }
  }
);

// ==============================
// GET MY PROFILE
// ==============================

app.get(
  "/api/profile",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const result = await pool.query(
        `
        SELECT
          id,
          name,
          email,
          phone,
          location,
          skills
        FROM users
        WHERE id = $1
        `,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      res.json(result.rows[0]);

    } catch (error) {
      console.error("Profile error:", error);

      res.status(500).json({
        message: "Could not load profile.",
      });
    }
  }
);


// ==============================
// UPDATE MY PROFILE
// ==============================

app.put(
  "/api/profile",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const {
        phone,
        location,
        skills,
      } = req.body;

      const result = await pool.query(
        `
        UPDATE users

        SET
          phone = $1,
          location = $2,
          skills = $3

        WHERE id = $4

        RETURNING
          id,
          name,
          email,
          phone,
          location,
          skills
        `,
        [
          phone || null,
          location || null,
          skills || null,
          userId,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      res.json({
        message: "Profile updated successfully.",
        user: result.rows[0],
      });

    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      res.status(500).json({
        message: "Could not update profile.",
      });
    }
  }
);

// ==============================
// GET USER PUBLIC PROFILE
// ==============================
app.get(
  "/api/users/:id/profile",
  authenticateToken,
  async (req, res) => {
    try {
      const profileUserId = req.params.id;
      const loggedInUserId = req.user.id;
      const jobId = req.query.jobId;

      const userResult = await pool.query(
        `
        SELECT
          id,
          name,
          email,
          phone,
          location,
          skills
        FROM users
        WHERE id = $1
        `,
        [profileUserId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      const user = userResult.rows[0];

      let applicationStatus = null;
      let canViewContact = false;

      if (jobId) {
        const applicationResult = await pool.query(
          `
          SELECT
            applications.status,
            jobs.posted_by_id
          FROM applications

          JOIN jobs
            ON jobs.id = applications.job_id

          WHERE applications.job_id = $1
          AND applications.applicant_id = $2
          `,
          [jobId, profileUserId]
        );

        if (applicationResult.rows.length > 0) {
          const application = applicationResult.rows[0];

          if (
            String(application.posted_by_id) ===
            String(loggedInUserId)
          ) {
            applicationStatus = application.status;

            canViewContact =
              application.status === "accepted" ||
              application.status === "completed";
          }
        }
      }

      res.json({
        id: user.id,
        name: user.name,
        location: user.location,
        skills: user.skills,

        applicationStatus,
        canViewContact,

        email: canViewContact ? user.email : null,
        phone: canViewContact ? user.phone : null,
      });
    } catch (error) {
      console.error("Public profile error:", error);

      res.status(500).json({
        message: "Could not load user profile.",
      });
    }
  }
);

// ==============================
// SUBMIT REVIEW
// ==============================

app.post(
  "/api/reviews",
  authenticateToken,
  async (req, res) => {
    try {
      const reviewerId = req.user.id;

      const {
        applicationId,
        rating,
        comment,
      } = req.body;

      if (!applicationId || !rating) {
        return res.status(400).json({
          message: "Rating is required.",
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5.",
        });
      }

      const applicationResult =
        await pool.query(
          `
          SELECT
            applications.id,
            applications.applicant_id,
            applications.status,
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

      if (application.status !== "completed") {
        return res.status(400).json({
          message:
            "Reviews can only be submitted after work is completed.",
        });
      }

      const applicantId =
        String(application.applicant_id);

      const posterId =
        String(application.posted_by_id);

      const currentUserId =
        String(reviewerId);

      let revieweeId;

      if (currentUserId === applicantId) {
        revieweeId = posterId;
      } else if (currentUserId === posterId) {
        revieweeId = applicantId;
      } else {
        return res.status(403).json({
          message:
            "You cannot review this work.",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO reviews
        (
          application_id,
          reviewer_id,
          reviewee_id,
          rating,
          comment
        )

        VALUES ($1, $2, $3, $4, $5)

        RETURNING *
        `,
        [
          applicationId,
          reviewerId,
          revieweeId,
          rating,
          comment || null,
        ]
      );

      res.status(201).json({
        message: "Review submitted successfully.",
        review: result.rows[0],
      });

    } catch (error) {

      if (error.code === "23505") {
        return res.status(409).json({
          message:
            "You already reviewed this work.",
        });
      }

      console.error(
        "Submit review error:",
        error
      );

      res.status(500).json({
        message:
          "Could not submit review.",
      });
    }
  }
);

// ==============================
// CHECK MY REVIEW
// ==============================

app.get(
  "/api/applications/:id/my-review",
  authenticateToken,
  async (req, res) => {
    try {
      const applicationId = req.params.id;
      const reviewerId = req.user.id;

      const result = await pool.query(
        `
        SELECT
          id,
          rating,
          comment,
          created_at
        FROM reviews

        WHERE application_id = $1
        AND reviewer_id = $2
        `,
        [applicationId, reviewerId]
      );

      if (result.rows.length === 0) {
        return res.json({
          reviewed: false,
        });
      }

      res.json({
        reviewed: true,
        review: result.rows[0],
      });

    } catch (error) {
      console.error(
        "Check review error:",
        error
      );

      res.status(500).json({
        message:
          "Could not check review.",
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