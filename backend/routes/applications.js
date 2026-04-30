const express = require("express");
const router = express.Router();

const Application = require("../models/Application");
const Job = require("../models/Job");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

// ================= APPLY FOR JOB =================
router.post("/", verifyToken, allowRoles("expert"), async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    const existing = await Application.findOne({
      job: jobId,
      expert: req.user.id
    });

    if (existing) {
      return res.status(400).json({ msg: "You already applied for this job" });
    }

    const application = new Application({
      job: jobId,
      expert: req.user.id,
      client: job.client,
      coverLetter: coverLetter || ""
    });

    await application.save();

    res.status(201).json({
      msg: "Application submitted successfully",
      application
    });

  } catch (error) {
    console.error("APPLICATION CREATE ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= EXPERT: MY APPLICATIONS =================
router.get("/my", verifyToken, allowRoles("expert"), async (req, res) => {
  try {
    const applications = await Application.find({ expert: req.user.id })
      .populate("job", "title description")
      .populate("client", "name username email");

    res.json(applications);

  } catch (error) {
    console.error("MY APPLICATIONS ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= CLIENT: VIEW JOB APPLICANTS =================
router.get("/job/:jobId", verifyToken, allowRoles("client"), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    if (String(job.client) !== String(req.user.id)) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate("expert", "name username email skills bio profilePic contact")
      .populate("job", "title");

    res.json(applications);

  } catch (error) {
    console.error("JOB APPLICATIONS ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= CLIENT: UPDATE STATUS =================
router.put("/:applicationId/status", verifyToken, allowRoles("client"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    if (String(application.client) !== String(req.user.id)) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    application.status = status;
    await application.save();

    res.json({
      msg: "Application status updated",
      application
    });

  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;