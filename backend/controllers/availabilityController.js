const Availability = require('../models/Availability');
const Tutor = require('../models/Tutor');

exports.create = async (req, res) => {
    try {
        const { day, startTime, endTime, meetingType } = req.body;

        // check that all necessary fields are there
        if (!day || !startTime || !endTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!['online', 'in-person', 'both'].includes(meetingType)) {
            return res.status(400).json({ error: 'Invalid meeting type' });
        }

        // create the Availability in the database
        const newAvailability = await Availability.create({
            tutor: req.tutor._id,
            day: day,
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
        const { day, startTime, endTime, meetingType } = req.body;

        const availability = await Availability.findOne({ _id: req.params.id });
        if (!availability) {
            return res.status(404).json({ error: 'Availability not found' });
        }

        if (day) {
            availability.day = day;
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