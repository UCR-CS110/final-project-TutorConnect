const mongoose = require('mongoose');

const TutorSchema = new mongoose.Schema(
    {
        // Connects this tutor profile to a user account
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        bio: {
            type: String,
            default: '',
            trim: true
        },
        subjects: {
            type: [String],
            default: []
        },
        cost: {
            type: Number,
            default: 0
        },
        ratingAverage: {
            type: Number,
            default: 0
        },
        numRatings: {
            type: Number,
            default: 0
        },
        relatedWork: {
            type: String,
            default: '',
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Tutor', TutorSchema);
