const router = require("express").Router();
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