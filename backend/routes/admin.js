const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

// ================= GET ALL USERS =================
router.get("/users", verifyToken, allowRoles("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("ADMIN USERS ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= GET ALL JOBS =================
router.get("/jobs", verifyToken, allowRoles("admin"), async (req, res) => {
  try {
    const jobs = await Job.find().populate("client", "name email");
    res.json(jobs);
  } catch (error) {
    console.error("ADMIN JOBS ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= GET ALL APPLICATIONS =================
router.get("/applications", verifyToken, allowRoles("admin"), async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("job", "title")
      .populate("expert", "name email");

    res.json(applications);
  } catch (error) {
    console.error("ADMIN APPLICATIONS ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= DELETE USER =================
router.delete("/users/:id", verifyToken, allowRoles("admin"), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User deleted" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= DELETE JOB =================
router.delete("/jobs/:id", verifyToken, allowRoles("admin"), async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ msg: "Job deleted" });
  } catch (error) {
    console.error("DELETE JOB ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;