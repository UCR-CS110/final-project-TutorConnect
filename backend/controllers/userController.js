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

        res.status(200).json({ message: 'User updated successfully', user: req.user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'User update failed', details: error.message });
    }
}