const Availability = require('../models/Availability');
const Tutor = require('../models/Tutor');

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
            availabilities: availabilities
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