const express = require("express");
const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Admin access only" });
  }
  next();
}

router.get("/users", auth, adminOnly, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

router.get("/jobs", auth, adminOnly, async (req, res) => {
  const jobs = await Job.find().populate("client", "name email");
  res.json(jobs);
});

router.get("/applications", auth, adminOnly, async (req, res) => {
  const applications = await Application.find()
    .populate("job", "title")
    .populate("expert", "name email");
  res.json(applications);
});

router.delete("/users/:id", auth, adminOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ msg: "User deleted" });
});

router.delete("/jobs/:id", auth, adminOnly, async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ msg: "Job deleted" });
});

module.exports = router;

const router = require("express").Router();
const User = require("../models/User");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

router.get("/users", verifyToken, allowRoles("admin"), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

module.exports = router;