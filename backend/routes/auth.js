res.json({
  token,
  user: {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role
  }
});