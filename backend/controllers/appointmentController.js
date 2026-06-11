const Appointment = require('../models/Appointment');
const Tutor = require('../models/Tutor');

exports.create = async (req, res) => {
    try {
        const { tutorId, date, startTime, endTime, location, subject } = req.body;

        // make sure the tutor exists
        const tutor = await Tutor.findOne({ _id: tutorId });
        if (!tutor) {
            return res.status(404).json({ error: 'Tutor not found' });
        }

        // make sure all the needed fields are present
        if (!startTime || !endTime || !location || !subject) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const lowercaseSubject = subject.toLowerCase();

        if (date) {
            // check that the date is in YYYY-MM-DD format
            const formatRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!formatRegex.test(req.body.date)) {
                return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
            }

            // check that it's a valid date (e.g. not 2026-13-45)
            const tempDate = new Date(req.body.date);
            if (isNaN(tempDate.getTime())) {
                return res.status(400).json({ error: 'Invalid date' });
            }

            // check that the date is today or in the future
            const today = new Date();
            today.setHours(0, 0, 0, 0); // strip time so we compare dates only
            if (date < today) {
                return res.status(400).json({ error: 'Date must be today or in the future' });
            }
        }

        if (location !== 'online' && location !== 'in-person') {
            return res.status(400).json({ error: 'Location must be online or in-person' });
        }

        const newAppointment = await Appointment.create({
            tutor: tutorId,
            student: req.session.userId,
            date: date,
            startTime: startTime,
            endTime: endTime,
            location: location,
            subject: lowercaseSubject
        });

        res.status(201).json({
            message: 'Appointment created successfully',
            appointment: newAppointment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Appointment creation failed', details: error.message });
    }
}

exports.getAppointment = async (req, res) => {
    try {
        // make sure the appointment exists
        const appointment = await Appointment.findOne({ _id: req.params.id });
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        res.status(200).json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Appointment retrieval failed', details: error.message });
    }
}

exports.delete = async (req, res) => {
    try {
        // make sure the appointment exists
        const appointment = await Appointment.findOne({ _id: req.params.id });
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // make sure the appointment belongs to the current user (either student or tutor)
        const isStudent = appointment.student.toString() === req.session.userId;
        const isTutor = req.tutor && req.tutor._id.toString() === appointment.tutor.toString();
        if (!isStudent && !isTutor) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // delete the appointment
        await appointment.deleteOne();

        res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Appointment deletion failed', details: error.message });
    }
}

exports.update = async (req, res) => {
    try {
        // make sure the appointment exists
        const appointment = await Appointment.findOne({ _id: req.params.id });
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // make sure the appointment belongs to the current user (either student or tutor)
        const isStudent = appointment.student.toString() === req.session.userId;
        const isTutor = req.tutor && req.tutor._id.toString() === appointment.tutor.toString();
        if (!isStudent && !isTutor) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // update the appointment
        if (req.body.date != undefined) {
            // check that the date is in YYYY-MM-DD format
            const formatRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!formatRegex.test(req.body.date)) {
                return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
            }

            // check that it's a valid date (e.g. not 2026-13-45)
            const date = new Date(req.body.date);
            if (isNaN(date.getTime())) {
                return res.status(400).json({ error: 'Invalid date' });
            }

            // check that the date is today or in the future
            const today = new Date();
            today.setHours(0, 0, 0, 0); // strip time so we compare dates only
            if (date < today) {
                return res.status(400).json({ error: 'Date must be today or in the future' });
            }

            appointment.date = req.body.date;
        }

        if (req.body.startTime != undefined) {
            appointment.startTime = req.body.startTime;
        }

        if (req.body.endTime != undefined) {
            appointment.endTime = req.body.endTime;
        }

        if (req.body.location != undefined) {
            if (req.body.location !== 'online' && req.body.location !== 'in-person') {
                return res.status(400).json({ error: 'Location must be online or in-person' });
            }
            appointment.location = req.body.location;
        }

        if (req.body.subject != undefined) {
            appointment.subject = req.body.subject;
        }

        await appointment.save();

        res.status(200).json({ message: 'Appointment updated successfully', appointment: appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Appointment update failed', details: error.message });
    }
}