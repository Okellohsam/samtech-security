const router = require("express").Router();
const User = require("../models/User");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

router.get("/users", verifyToken, allowRoles("admin"), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

module.exports = router;