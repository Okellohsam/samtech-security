const express = require("express");
const router = express.Router();

const Job = require("../models/Job");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

// ================= CREATE JOB (CLIENT ONLY) =================
router.post("/", verifyToken, allowRoles("client"), async (req, res) => {
  try {
    const job = new Job({
      title: req.body.title,
      description: req.body.description,
      skillsRequired: req.body.skills,
      client: req.user.id
    });

    await job.save();

    res.status(201).json(job);

  } catch (error) {
    console.error("CREATE JOB ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= GET ALL JOBS (EXPERTS) =================
router.get("/", verifyToken, allowRoles("expert", "admin"), async (req, res) => {
  try {
    const jobs = await Job.find().populate("client", "name username");
    res.json(jobs);

  } catch (error) {
    console.error("GET JOBS ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;