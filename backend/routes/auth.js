const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const requireAuth = require('../middleware/auth');

// Routes

/*
Register (POST request)
input: username, email, password in the body
output:
    message: 'User registered successfully',
    token: token,
    user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
    }
*/
router.post('/register', usersController.register);

/*
Login (POST request)
input: username, password in the body
output:
    message: 'User logged in successfully',
    token: token,
    user: {
        id: user.id,
        name: user.name,
        email: user.email
    })
*/
router.post('/login', usersController.login);

/*
Logout (POST request)
input: nothing
output:
    message: 'Logout successful'
*/
router.post('/logout', requireAuth, usersController.logout);

/*
Me (GET request)
input: nothing
output:
    id: user.id,
    username: user.username,
    email: user.email
*/
router.get('/me', requireAuth, usersController.me);

module.exports = router;