const express = require("express");
const Message = require("../models/Message");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/user/:username", auth, async (req, res) => {
  try {
    const otherUser = await User.findOne({ username: req.params.username });
    if (!otherUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    const messages = await Message.find({
      $or: [
        { from: req.user.id, to: otherUser._id },
        { from: otherUser._id, to: req.user.id }
      ]
    })
      .sort({ createdAt: 1 })
      .populate("from", "name username")
      .populate("to", "name username");

    res.json(messages);
  } catch (error) {
    console.error("MESSAGES FETCH ERROR:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

module.exports = router;