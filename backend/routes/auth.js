const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const requireAuth = require('../middleware/auth');

// Auth routes ('/api/auth/...')

/*
Register: POST request ('/api/auth/register')
input: username, email, password in the body. no cookie needed.
output:
    message: 'User registered successfully',
    token: token,
    user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
    }
*/
router.post('/register', authController.register);

/*
Login: POST request ('/api/auth/login')
input: username, password in the body. no cookie needed.
output:
    message: 'User logged in successfully',
    token: token,
    user: {
        id: user.id,
        username: user.username,
        email: user.email
    })
*/
router.post('/login', authController.login);

/*
Logout: POST request ('/api/auth/logout')
input: nothing. must have a cookie with the session id.
output:
    message: 'Logout successful'
*/
router.post('/logout', requireAuth, authController.logout);

/*
Me: GET request ('/api/auth/me')
input: nothing. must have a cookie with the session id.
output:
    id: user.id,
    username: user.username,
    email: user.email
*/
router.get('/me', requireAuth, authController.me);

module.exports = router;