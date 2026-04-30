router.get("/my", verifyToken, allowRoles("expert"), async (req, res) => {
  try {
    const apps = await Application.find({ expert: req.user.id })
      .populate("job", "title");

    res.json(apps);

  } catch (error) {
    console.error("MY APPLICATIONS ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
});