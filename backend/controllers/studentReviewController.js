const StudentReview = require('../models/StudentReview');
const User = require('../models/User');
const Tutor = require('../models/Tutor');
const Appointment = require('../models/Appointment');

const getAppointmentEndDateTime = (appointment) => {
  const dateText = appointment.date instanceof Date
    ? appointment.date.toISOString()
    : String(appointment.date || '');
  const dateMatch = dateText.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!dateMatch) return null;

  const [hours, minutes] = String(appointment.endTime || '').split(':').map(Number);
  if ([hours, minutes].some(Number.isNaN)) return null;

  return new Date(
    Number(dateMatch[1]),
    Number(dateMatch[2]) - 1,
    Number(dateMatch[3]),
    hours,
    minutes
  );
};

const isCompletedAppointment = (appointment) => {
  const endDateTime = getAppointmentEndDateTime(appointment);
  return endDateTime && endDateTime.getTime() <= Date.now();
};

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

    const appointments = await Appointment.find({
      tutor: tutor._id,
      student: studentId,
      confirmed: true
    });

    if (!appointments.some(isCompletedAppointment)) {
      return res.status(403).json({ error: 'You can only rate a student after a confirmed session has passed' });
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
