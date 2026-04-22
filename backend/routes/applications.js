const express = require("express");
const Application = require("../models/Application");
const Job = require("../models/Job");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "expert") {
      return res.status(403).json({ msg: "Only experts can apply" });
    }

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

    res.status(201).json({ msg: "Application submitted successfully", application });
  } catch (error) {
    console.error("APPLICATION CREATE ERROR:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

router.get("/my", auth, async (req, res) => {
  try {
    if (req.user.role !== "expert") {
      return res.status(403).json({ msg: "Only experts can view this" });
    }

    const applications = await Application.find({ expert: req.user.id })
      .populate("job", "title description")
      .populate("client", "name username email");

    res.json(applications);
  } catch (error) {
    console.error("MY APPLICATIONS ERROR:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

router.get("/job/:jobId", auth, async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ msg: "Only clients can view job applicants" });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    if (String(job.client) !== String(req.user.id)) {
      return res.status(403).json({ msg: "Not authorized to view applicants for this job" });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate("expert", "name username email skills bio profilePic contact")
      .populate("job", "title");

    res.json(applications);
  } catch (error) {
    console.error("JOB APPLICATIONS ERROR:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

router.put("/:applicationId/status", auth, async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ msg: "Only clients can update application status" });
    }

    const { status } = req.body;

    if (!["accepted", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const application = await Application.findById(req.params.applicationId).populate("job");
    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    if (String(application.client) !== String(req.user.id)) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    application.status = status;
    await application.save();

    res.json({ msg: "Application status updated", application });
  } catch (error) {
    console.error("UPDATE APPLICATION STATUS ERROR:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

module.exports = router;


const Application = require("../models/Application");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

// EXPERT → apply
router.post("/", verifyToken, allowRoles("expert"), async (req, res) => {
  const app = new Application({
    ...req.body,
    expert: req.user.id
  });

  await app.save();
  res.json(app);
});

// CLIENT → view applicants
router.get("/:jobId", verifyToken, allowRoles("client"), async (req, res) => {
  const apps = await Application.find({ job: req.params.jobId })
    .populate("expert", "name username");

  res.json(apps);
});

module.exports = router;