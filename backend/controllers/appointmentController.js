const Appointment = require('../models/Appointment');
const Tutor = require('../models/Tutor');
const Availability = require('../models/Availability');

const isValidDateString = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

const getLocalDateTime = (date, time) => {
    if (!isValidDateString(date) || !time) return null;

    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = String(time).split(':').map(Number);

    if ([year, month, day, hours, minutes].some(Number.isNaN)) return null;

    const dateTime = new Date(year, month - 1, day, hours, minutes);
    if (
        dateTime.getFullYear() !== year ||
        dateTime.getMonth() !== month - 1 ||
        dateTime.getDate() !== day ||
        dateTime.getHours() !== hours ||
        dateTime.getMinutes() !== minutes
    ) {
        return null;
    }

    return dateTime;
};

const getMinutesFromTime = (time) => {
    const [hours, minutes] = String(time || '').split(':').map(Number);
    if ([hours, minutes].some(Number.isNaN)) return null;
    return (hours * 60) + minutes;
};

const getDefaultAppointmentDate = () => {
    const twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate() + 14);
    return twoWeeks.toISOString().slice(0, 10);
};

const getStoredDateValue = (date) => {
    if (!date) return '';

    if (date instanceof Date) {
        return date.toISOString().slice(0, 10);
    }

    return String(date).slice(0, 10);
};

const validateAppointmentDateTime = (date, startTime, endTime) => {
    if (!isValidDateString(date)) {
        return 'Date must be in YYYY-MM-DD format';
    }

    const startDateTime = getLocalDateTime(date, startTime);
    if (!startDateTime) {
        return 'Invalid date or start time';
    }

    const endMinutes = getMinutesFromTime(endTime);
    const startMinutes = getMinutesFromTime(startTime);
    if (endMinutes === null) {
        return 'Invalid end time';
    }

    if (endMinutes <= startMinutes) {
        return 'End time must be after start time';
    }

    if (startDateTime.getTime() <= Date.now()) {
        return 'Booking must be for a future date and time. Please choose another date.';
    }

    return null;
};

exports.create = async (req, res) => {
    try {
        const { tutorId, date, startTime, endTime, location, subject, availabilityId } = req.body;

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
        const appointmentDate = date || getDefaultAppointmentDate();

        const dateTimeError = validateAppointmentDateTime(appointmentDate, startTime, endTime);
        if (dateTimeError) {
            return res.status(400).json({ error: dateTimeError });
        }

        if (location !== 'online' && location !== 'in-person') {
            return res.status(400).json({ error: 'Location must be online or in-person' });
        }

        const existingAppointment = await Appointment.findOne({
            tutor: tutorId,
            startTime: startTime,
            endTime: endTime
        });

        if (existingAppointment && getStoredDateValue(existingAppointment.date) === appointmentDate) {
            return res.status(400).json({ error: 'This time slot is already booked. Please choose another time.' });
        }

        let confirmed = false;
        if (availabilityId) {
            const availability = await Availability.findOne({ _id: availabilityId, tutor: tutorId });
            if (!availability) {
                return res.status(404).json({ error: 'Availability slot not found' });
            }

            const availabilityDate = getStoredDateValue(availability.date);
            const availabilityMatchesBooking = availabilityDate === appointmentDate
                && availability.startTime === startTime
                && availability.endTime === endTime
                && (availability.meetingType === 'both' || availability.meetingType === location);

            if (!availabilityMatchesBooking) {
                return res.status(400).json({ error: 'Availability slot does not match this booking' });
            }

            confirmed = true;
        }

        const newAppointment = await Appointment.create({
            tutor: tutorId,
            student: req.session.userId,
            date: appointmentDate,
            startTime: startTime,
            endTime: endTime,
            location: location,
            subject: lowercaseSubject,
            confirmed: confirmed,
            availability: availabilityId || undefined
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

        let isTutor = false;
        const tutor = await Tutor.findOne({ _id: appointment.tutor });
        if (tutor) {
            if (tutor.user.toString() === req.session.userId) {
                isTutor = true;
            }
        }

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

        let isTutor = false;
        const tutor = await Tutor.findOne({ _id: appointment.tutor });
        if (tutor) {
            if (tutor.user.toString() === req.session.userId) {
                isTutor = true;
            }
        }

        if (!isStudent && !isTutor) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const nextDate = req.body.date != undefined
            ? req.body.date
            : appointment.date.toISOString().slice(0, 10);
        const nextStartTime = req.body.startTime != undefined ? req.body.startTime : appointment.startTime;
        const nextEndTime = req.body.endTime != undefined ? req.body.endTime : appointment.endTime;
        const dateTimeError = validateAppointmentDateTime(nextDate, nextStartTime, nextEndTime);
        if (dateTimeError) {
            return res.status(400).json({ error: dateTimeError });
        }

        // update the appointment
        if (req.body.date != undefined) {
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

        if (req.body.confirmed != undefined) {
            if (!isTutor) {
                return res.status(403).json({ error: 'Only the tutor can confirm appointments' });
            }

            if (req.body.confirmed !== true && req.body.confirmed !== false) {
                return res.status(400).json({ error: 'Confirmed must be true or false' });
            }
            appointment.confirmed = req.body.confirmed;
        }

        await appointment.save();

        res.status(200).json({ message: 'Appointment updated successfully', appointment: appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Appointment update failed', details: error.message });
    }
}
