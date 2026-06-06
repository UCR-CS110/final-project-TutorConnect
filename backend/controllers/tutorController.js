const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tutor = require('../models/Tutor');
const Review = require('../models/Review');

exports.register = async (req, res) => {
    try {
        const { bio, subjects, cost, relatedWork } = req.body;

        // see if the user is already registered as a tutor
        const tutor = await Tutor.findOne({ user: req.session.userId });
        if (tutor) {
            return res.status(400).json({ error: 'User is already registered as a tutor' });
        }

        // create the tutor in the database
        const newTutor = await Tutor.create({
            user: req.session.userId,
            bio: bio,
            subjects: subjects,
            cost: cost,
            relatedWork: relatedWork
        });
        
        res.status(201).json({
            message: 'Tutor registered successfully',
            tutor: newTutor
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Tutor registration failed', details: error.message });
    }
}

exports.delete = async (req, res) => {
    try {
        // delete the tutor from the database
        await Tutor.deleteOne({ user: req.session.userId });

        res.status(200).json({ message: 'Tutor deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Tutor deletion failed', details: error.message });
    }
}

exports.getInfo = async (req, res) => {
    try {
        // check that the tutor exists
        const tutor = await Tutor.findOne({ user: req.params.id });
        if (!tutor) {
            return res.status(404).json({ error: 'Tutor not found' });
        }

        // return the information about the tutor
        res.status(200).json({
            userid: tutor.user,
            bio: tutor.bio,
            subjects: tutor.subjects,
            cost: tutor.cost,
            ratingAverage: tutor.ratingAverage,
            numRatings: tutor.numRatings,
            relatedWork: tutor.relatedWork
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Tutor info retrieval failed', details: error.message });
    }
}

exports.updateBio = async (req, res) => {
    try {
        // modify the tutor's bio and save it to the database
        req.tutor.bio = req.body.bio;
        await req.tutor.save();
        
        res.status(200).json({ message: 'Tutor bio updated successfully', tutor: req.tutor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Tutor bio update failed', details: error.message });
    }
}

exports.getReviews = async (req, res) => {
    try {
        // check that the tutor exists
        const tutor = await Tutor.findOne({ user: req.params.id });
        if (!tutor) {
            return res.status(404).json({ error: 'Tutor not found' });
        }

        // get all of the reviews for the tutor
        const reviews = await Review.find({ tutor: req.params.id });
        
        res.status(200).json({
            reviews: reviews
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Review retrieval failed', details: error.message });
    }
}

exports.updateCost = async (req, res) => {
    console.log('req.tutor:', req.tutor);
    console.log('req.body:', req.body);
    try {
        // modify the tutor's cost and save it to the database
        req.tutor.cost = req.body.cost;
        await req.tutor.save();
        
        res.status(200).json({ message: 'Tutor cost updated successfully', tutor: req.tutor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Tutor cost update failed', details: error.message });
    }
}

exports.updateRelatedWork = async (req, res) => {
    try {
        // modify the tutor's related work and save it to the database
        req.tutor.relatedWork = req.body.relatedWork;
        await req.tutor.save();
        
        res.status(200).json({ message: 'Tutor related work updated successfully', tutor: req.tutor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Tutor related work update failed', details: error.message });
    }
}