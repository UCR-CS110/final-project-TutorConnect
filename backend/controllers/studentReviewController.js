const StudentReview = require('../models/StudentReview');
const User = require('../models/User');
const Tutor = require('../models/Tutor');

exports.create = async (req, res) => {
  try {
    const { studentId, rating, comment } = req.body;

    const tutor = await Tutor.findOne({ user: req.session.userId });
    if (!tutor) {
      return res.status(403).json({ error: 'Only tutors can rate students' });
    }

    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const review = await StudentReview.create({
      student: studentId,
      tutor: tutor._id,
      rating: numericRating,
      comment: comment || ''
    });

    student.ratingAverage = (student.ratingAverage * student.numRatings + numericRating) / (student.numRatings + 1);
    student.numRatings = student.numRatings + 1;
    await student.save();

    res.status(201).json({ message: 'Student review created successfully', review: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Student review creation failed', details: error.message });
  }
};
