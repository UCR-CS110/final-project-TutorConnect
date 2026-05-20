const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const requireAuth = require('../middleware/auth');

// Auth routes ('/api/auth/...')

/*
register: POST request ('/api/auth/register')
function: Takes in a username, email, and password and creates a new user. the user is saved to the database.
          A session is created for the user and a cookie is sent back to the client. The session is stored in
          the database until the user logs out or the session expires.
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
login: POST request ('/api/auth/login')
function: Takes in a username and password and logs the user in. A session is created for the user and a 
          cookie is sent back to the client. The session is stored in the database until the user logs 
          out or the session expires.
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
logout: POST request ('/api/auth/logout')
function: Logs the user out. The session is destroyed and the cookie is cleared from the browser.
input: nothing. must have a cookie with the session id.
output:
    message: 'Logout successful'
*/
router.post('/logout', requireAuth, authController.logout);

/*
me: GET request ('/api/auth/me')
logout: Returns the user information for the user that is currently logged in based on the cookie passed in.
input: nothing. must have a cookie with the session id.
output:
    id: user.id,
    username: user.username,
    email: user.email
*/
router.get('/me', requireAuth, authController.me);

module.exports = router;