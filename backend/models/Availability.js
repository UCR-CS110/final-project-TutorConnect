const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema(
    {
        // Tutor this availability belongs to
        tutor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tutor',
            required: true
        },
        day: {
            type: String,
            required: true,
            trim: true
        },
        startTime: {
            type: String,
            required: true,
            trim: true
        },
        endTime: {
            type: String,
            required: true,
            trim: true
        },
        meetingType: {
            type: String,
            enum: ['online', 'in-person', 'both'],
            default: 'online'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Availability', AvailabilitySchema);
