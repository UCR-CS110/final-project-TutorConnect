const User = require('../models/User');
const Tutor = require('../models/Tutor');
const Review = require('../models/Review');
const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');

exports.register = async (req, res) => {
    try {
        const { bio, subjects, cost, relatedWork } = req.body;

        // see if the user is already registered as a tutor
        const tutor = await Tutor.findOne({ user: req.session.userId });
        if (tutor) {
            return res.status(400).json({ error: 'User is already registered as a tutor' });
        }

        // make the subjects lowercase
        const lowercaseSubjects = subjects.map(subject => subject.toLowerCase());

        // create the tutor in the database
        const newTutor = await Tutor.create({
            user: req.session.userId,
            bio: bio,
            subjects: lowercaseSubjects,
            cost: cost,
            relatedWork: relatedWork
        });

        // change the user's role to tutor
        const user = await User.findOne({ _id: req.session.userId });
        user.role = 'tutor';
        await user.save();
        
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
        // change the user's role to student
        const user = await User.findOne({ _id: req.session.userId });
        user.role = 'student';
        await user.save();

        // delete reviews on the tutor
        const tutor = await Tutor.findOne({ user: req.session.userId });
        await Review.deleteMany({ tutor: tutor._id });

        // delete the availability of the tutor
        await Availability.deleteMany({ tutor: tutor._id });

        // delete the tutor from the database
        await tutor.deleteOne();

        res.status(200).json({ message: 'Tutor deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Tutor deletion failed', details: error.message });
    }
}

exports.getInfo = async (req, res) => {
    try {
        // check that the tutor exists
        const tutor = await Tutor.findOne({ _id: req.params.id });
        if (!tutor) {
            return res.status(404).json({ error: 'Tutor not found' });
        }

        // return the information about the tutor
        res.status(200).json(tutor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Tutor info retrieval failed', details: error.message });
    }
}

exports.getReviews = async (req, res) => {
    try {
        // check that the tutor exists
        const tutor = await Tutor.findOne({ _id: req.params.id });
        if (!tutor) {
            return res.status(404).json({ error: 'Tutor not found' });
        }

        // get all of the reviews for the tutor
        const reviews = await Review.find({ tutor: req.params.id });
        
        res.status(200).json({
            reviews: reviews,
            ratingAverage: tutor.ratingAverage
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Review retrieval failed', details: error.message });
    }
}

exports.update = async (req, res) => {
    try {
        if (req.body.bio != undefined) {
            req.tutor.bio = req.body.bio;
            await req.tutor.save();
        }

        if (req.body.subjects != undefined) {
            req.tutor.subjects = req.body.subjects.map(subject => subject.toLowerCase());
            await req.tutor.save();
        }

        if (req.body.cost != undefined) {
            req.tutor.cost = req.body.cost;
            await req.tutor.save();
        }

        if (req.body.relatedWork != undefined) {
            req.tutor.relatedWork = req.body.relatedWork;
            await req.tutor.save();
        }

        res.status(200).json({ message: 'Tutor updated successfully', tutor: req.tutor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Tutor update failed', details: error.message });
    }
}

exports.get = async (req, res) => {
    try {
        res.status(200).json(req.tutor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Tutor retrieval failed', details: error.message });
    }
}

exports.getAllTutors = async (req, res) => {
    try {
        const tutors = await Tutor.find();

        res.status(200).json({
            tutors: tutors
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Tutor retrieval failed', details: error.message });
    }
}

exports.getTutorsBySubject = async (req, res) => {
    try {
        const tutors = await Tutor.find({ subjects: req.params.subject.toLowerCase() });

        res.status(200).json({
            tutors: tutors
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Tutor retrieval failed', details: error.message });
    }
}

exports.getAppointments = async (req, res) => {
    try {
        // if the user is a tutor, find all of the appointments they're going to tutor
        const tutor = await Tutor.findOne({ user: req.session.userId });
        let tutoring = [];
        if (tutor) {
            tutoring = await Appointment.find({ tutor: tutor._id });
        }

        // if the user is either a student or a tutor, find all of the appointments they're going to
        const appointments = await Appointment.find({ student: req.session.userId });

        res.status(200).json({
            tutoring: tutoring,
            appointments: appointments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Appointment retrieval failed', details: error.message });
    }
}