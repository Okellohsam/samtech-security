
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
router.get("/my", verifyToken, allowRoles("expert"), async (req, res) => {
  try {
    const apps = await Application.find({ expert: req.user.id })
        .populate("job", "title description")
        .populate("client", "name username")

    res.json(apps);

  } catch (error) {
    console.error("MY APPLICATIONS ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
});
