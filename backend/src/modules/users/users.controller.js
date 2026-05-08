exports.getMe = async (req, res) => {
  // req.user is set by protect middleware
  res.json({ user: req.user });
};