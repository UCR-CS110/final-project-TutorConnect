const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
    {
        // Tutor being reviewed
        tutor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tutor',
            required: true
        },
        // Student who wrote the review
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        subject: {
            type: String,
            required: true,
            trim: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            default: '',
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Review', ReviewSchema);
