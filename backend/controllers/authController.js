const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // check if name, email, and password are provided
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        // check if email is already in use
        const existingUser = await User.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // check if the username is already in use
        const existingUsername = await User.findUserByUsername(username);
        if (existingUsername) {
            return res.status(400).json({ error: 'Username already in use' });
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create the user in the database
        const newUser = await User.createUser(name, email, hashedPassword);

        // save to session
        req.session.userID = newUser.id;

        // send the response to the client
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
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
        const user = await User.findUserByUsername(username);

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
        req.session.userID = user.id;

        // send the response to the client
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.logout = async (req, res) => {
    try {
        // destroy the session
        req.session.destroy();

        // clear the cookie
        res.clearCookie('connect.sid');

        // return the response
        res.status(200).json({ message: 'Logout successful' });
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
    const user = await User.findUserById(req.session.userId);

    // check if the user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // return the response
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};