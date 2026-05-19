const bcrypt = require('bcryptjs');
const jst = require('jsonwebtoken');
const User = require('../models/User');

const USE_MOCK = true;
const mockUser = [
    {username: 'cmak000', email: 'cmak000@ucr.edu', password: 'password000'},
    {username: 'cmak001', email: 'cmak000@ucr.edu', password: 'password001'}
];

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

        // create a JWT token so the user can be logged in
        const token = jst.sign(
            { id: newUser.id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // send the response to the client
        res.status(201).json({
            message: 'User registered successfully',
            token: token,
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

        // create a JWT token so the user can be logged in
        const token = jst.sign(
            { id: user.id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // send the response to the client
        res.status(200).json({
            message: 'Login successful',
            token: token,
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