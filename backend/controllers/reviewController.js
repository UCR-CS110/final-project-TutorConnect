const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tutor = require('../models/Tutor');
const Review = require('../models/Review');

exports.create = async (req, res) => {
    try {
        const { tutorId, subject, rating, comment } = req.body;

        // make sure the tutor exists
        const tutor = await Tutor.findOne({ user: tutorId });
        if (!tutor) {
            return res.status(404).json({ error: 'Tutor not found' });
        }

        // create the review in the database
        const newReview = await Review.create({
            tutor: tutorId,
            student: req.session.userId,
            subject: subject,
            rating: rating,
            comment: comment
        });

        // update the average rating and number of ratings of the tutor
        tutor.ratingAverage = (tutor.ratingAverage * tutor.numRatings + rating) / (tutor.numRatings + 1);
        tutor.numRatings = tutor.numRatings + 1;
        await tutor.save();
        
        res.status(201).json({
            message: 'Review created successfully',
            review: newReview
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Review creation failed', details: error.message });
    }
}

exports.reviewsIssued = async (req, res) => {
    try {
        // if userId is not provided, use the current user
        let user = req.session.userId;
        if (req.params.userId) {
            user = req.params.userId;
        }

        const reviews = await Review.find({ student: user });

        res.status(200).json({
            reviews: reviews
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Review retrieval failed', details: error.message });
    }
}

exports.delete = async (req, res) => {
    try {
        // check that the user is the owner of the review
        const review = await Review.findOne({ _id: req.params.id });
        if (review.student != req.session.userId) {
            return res.status(403).json({ error: 'You are not authorized to delete this review' });
        }

        // update the tutor info if the tutor still exists
        const tutor = await Tutor.findOne({ user: review.tutor });
        if (tutor) {
            if (tutor.numRatings == 1) {
                tutor.ratingAverage = 0;
                tutor.numRatings = 0;
            } else {
                tutor.ratingAverage = (tutor.ratingAverage * tutor.numRatings - review.rating) / (tutor.numRatings - 1);
                tutor.numRatings = tutor.numRatings - 1;
            }
            await tutor.save();
        }

        // delete the review
        await review.deleteOne();

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Review deletion failed', details: error.message });
    }
}

exports.update = async (req, res) => {
    try {
        // check if the user is the owner of the review
        const review = await Review.findOne({ _id: req.params.id });
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (review.student != req.session.userId) {
            return res.status(403).json({ error: 'You are not authorized to edit this review' });
        }

        if (req.body.rating != undefined) {
            // update the average rating for the tutor
            const tutor = await Tutor.findOne({ user: review.tutor });
            if (tutor) {
                tutor.ratingAverage = (tutor.ratingAverage * tutor.numRatings - review.rating + req.body.rating) / tutor.numRatings;
                await tutor.save();
            }

            review.rating = req.body.rating;
        }

        if (req.body.comment != undefined) {
            review.comment = req.body.comment;
        }

        await review.save();

        res.status(200).json({
            message: 'Review updated successfully',
            review: review
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Review update failed', details: error.message });
    }
}

exports.getReview = async (req, res) => {
    try {
        const review = await Review.findOne({ _id: req.params.id });

        res.status(200).json({
            review: review
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Review retrieval failed', details: error.message });
    }
}