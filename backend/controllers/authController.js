const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { username, email, password, role = 'student', school = '' } = req.body;
        const accountRole = role === 'tutor' ? 'tutor' : 'student';
        const accountSchool = accountRole === 'student' && typeof school === 'string' ? school.trim() : '';

        // check if name, email, and password are provided
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        // check if email is already in use
        const existingUser = await User.findOne({email: email});
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // check if the username is already in use
        const existingUsername = await User.findOne({username: username});
        if (existingUsername) {
            return res.status(400).json({ error: 'Username already in use' });
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create the user in the database
        const newUser = await User.create({
            username: username,
            email: email,
            password: hashedPassword,
            role: accountRole,
            school: accountSchool
        });

        // save to session
        req.session.userId = newUser._id;

        // send the response to the client
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role || 'student',
                school: newUser.school || '',
                ratingAverage: newUser.ratingAverage || 0,
                numRatings: newUser.numRatings || 0
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // check if username and password are provided
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // find the user in the database
        const user = await User.findOne({username: username});

        // check if the user exists
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // check if the password is correct
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // save to session
        req.session.userId = user._id;

        // send the response to the client
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
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
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.logout = async (req, res) => {
    try {
        // destroy the session with callback to ensure it's properly cleared
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
                return res.status(500).json({ error: 'Logout failed' });
            }

            // clear the cookie with the same options
            res.clearCookie('connect.sid', {
                httpOnly: true,
                secure: false,
                path: '/'
            });

            // return the response
            res.status(200).json({ message: 'Logout successful' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Logout failed' });
    }
};

exports.me = async (req, res) => {
  try {
    // check if the user is logged in
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    // find the user in the database
    const user = await User.findOne({_id: req.session.userId});

    // check if the user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // return the response
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role || 'student',
      school: user.school || '',
      ratingAverage: user.ratingAverage || 0,
      numRatings: user.numRatings || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};
