const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.update = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.session.userId });

        if (req.body.username != undefined) {
            user.username = req.body.username;
            await user.save();
        }

        if (req.body.email != undefined) {
            user.email = req.body.email;
            await user.save();
        }

        if (req.body.password != undefined) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            user.password = hashedPassword;
            await user.save();
        }

        if (req.body.school != undefined) {
            user.school = req.body.school;
            await user.save();
        }

        res.status(200).json({
            message: 'User updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role || 'student',
                school: user.school || '',
                ratingAverage: user.ratingAverage || 0,
                numRatings: user.numRatings || 0
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'User update failed', details: error.message });
    }
}

exports.getUser = async (req, res) => {
    try {
        // see if the user exists
        const user = await User.findOne({ _id: req.params.id }).select('username email role school ratingAverage numRatings');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'User retrieval failed', details: error.message });
    }
}

exports.getStudents = async (req, res) => {
    try {
        const search = req.query.search || '';
        const query = {
            role: 'student'
        };

        if (search.trim()) {
            query.$or = [
                { username: { $regex: search.trim(), $options: 'i' } },
                { email: { $regex: search.trim(), $options: 'i' } },
                { school: { $regex: search.trim(), $options: 'i' } }
            ];
        }

        const students = await User.find(query).select('username email role school ratingAverage numRatings');

        res.status(200).json({ students: students });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Student search failed', details: error.message });
    }
}
