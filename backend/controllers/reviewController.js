const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Review = require('../models/Review');

exports.create = async (req, res) => {
    try {

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Review creation failed', details: error.message });
    }
}