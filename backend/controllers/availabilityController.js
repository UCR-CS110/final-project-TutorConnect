const Availability = require('../models/Availability');
const Tutor = require('../models/Tutor');

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

const validateAvailabilityDateTime = (date, startTime, endTime) => {
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
        return 'Availability must be for a future date and time. Please choose another date.';
    }

    return null;
};

const getAvailabilityEndDateTime = (availability) => {
    const dateText = availability.date instanceof Date
        ? availability.date.toISOString()
        : String(availability.date || '');
    const date = dateText.slice(0, 10);
    return getLocalDateTime(date, availability.endTime);
};

exports.create = async (req, res) => {
    try {
        const { date, startTime, endTime, meetingType } = req.body;

        // check that all necessary fields are there
        if (!date || !startTime || !endTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // check that the meetingType is one of the valid options
        if (!['online', 'in-person', 'both'].includes(meetingType)) {
            return res.status(400).json({ error: 'Invalid meeting type' });
        }

        const dateTimeError = validateAvailabilityDateTime(date, startTime, endTime);
        if (dateTimeError) {
            return res.status(400).json({ error: dateTimeError });
        }

        // create the Availability in the database
        const newAvailability = await Availability.create({
            tutor: req.tutor._id,
            date: date,
            startTime: startTime,
            endTime: endTime,
            meetingType: meetingType
        });

        res.status(201).json({
            message: 'Availability created successfully',
            tutor: newAvailability
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Availability creation failed', details: error.message });
    }
}

exports.getAll = async (req, res) => {
    try {
        const availabilities = await Availability.find({ tutor: req.tutor._id });

        res.status(200).json({
            availabilities: availabilities.filter((availability) => {
                const endDateTime = getAvailabilityEndDateTime(availability);
                return !endDateTime || endDateTime.getTime() > Date.now();
            })
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Availability retrieval failed', details: error.message });
    }
}

exports.delete = async (req, res) => {
    try {
        // delete the availability from the database
        await Availability.deleteOne({ _id: req.params.id });

        res.status(200).json({ message: 'Availability deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Availability deletion failed', details: error.message });
    }
}

exports.update = async (req, res) => {
    try {
        const { date, startTime, endTime, meetingType } = req.body;

        const availability = await Availability.findOne({ _id: req.params.id });
        if (!availability) {
            return res.status(404).json({ error: 'Availability not found' });
        }

        if (date) {
            availability.date = date;
        }

        if (startTime) {
            availability.startTime = startTime;
        }

        if (endTime) {
            availability.endTime = endTime;
        }

        if (meetingType) {
            if (!['online', 'in-person', 'both'].includes(meetingType)) {
                return res.status(400).json({ error: 'Invalid meeting type' });
            }
            availability.meetingType = meetingType;
        }

        const nextDate = date || availability.date.toISOString().slice(0, 10);
        const nextStartTime = startTime || availability.startTime;
        const nextEndTime = endTime || availability.endTime;
        const dateTimeError = validateAvailabilityDateTime(nextDate, nextStartTime, nextEndTime);
        if (dateTimeError) {
            return res.status(400).json({ error: dateTimeError });
        }

        await availability.save();

        res.status(200).json({
            message: 'Availability updated successfully',
            availability: availability
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Availability update failed', details: error.message });
    }
}
