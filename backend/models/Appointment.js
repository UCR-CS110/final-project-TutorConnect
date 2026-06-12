const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
    {
        // Tutor this appointment is with
        tutor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tutor',
            required: true
        },
        // Student this appointment is with
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        date: {
            type: Date,
            required: true,
            default: () => {
                const twoWeeks = new Date();
                twoWeeks.setDate(twoWeeks.getDate() + 14);
                return twoWeeks;
            }
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
        location: {
            type: String,
            enum: ['online', 'in-person'],
            default: 'online'
        },
        subject: {
            type: String,
            required: true,
            trim: true
        },
        confirmed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Appointment', AppointmentSchema);
