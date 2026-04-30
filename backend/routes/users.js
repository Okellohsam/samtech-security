const express = require("express");
const router = express.Router();

const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");

// ================= GET CURRENT USER =================
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);

  } catch (error) {
    console.error("GET USER ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= UPDATE PROFILE =================
router.put("/me", verifyToken, async (req, res) => {
  try {
    const updates = { ...req.body };

    // 🔒 prevent sensitive updates
    delete updates.password;
    delete updates.role;
    delete updates.email;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select("-password");

    res.json(user);

  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;