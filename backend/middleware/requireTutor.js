const Tutor = require('../models/Tutor');

const requireTutor = async (req, res, next) => {
  try {
    const tutor = await Tutor.findOne({ user: req.session.userId });
    if (!tutor) {
      return res.status(404).json({ error: 'User is not registered as a tutor' });
    }

    req.tutor = tutor;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify tutor status' });
  }
};

module.exports = requireTutor;