const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const tutorController = require('../controllers/tutorController');
const requireAuth = require('../middleware/auth');

// User routes ('/api/user/...')

/*
update: PUT request ('/api/user/')
function: Updates the user information for the current user.
input: JSON body with any modification. The valid fields to be modified are "username", "email", "password", "school". ex:
    {
        "username": "newUsername",
        "email": "newEmail",
        "password": "newPassword",
        "school": "newSchool"
    }
output: If successful, returns (message: 'User updated successfully') and the user object in the form of a JSON.
        If not successful, returns error 500. (error: 'User update failed').
*/
router.put('/', requireAuth, userController.update);

/*
getAppointments: GET request ('/api/user/appointments')
function: Returns the list of appointments for the current user.
input: nothing
output: A JSON of arrays of appointments. "tutoring" contains all of the appointments
        that the current user is going to tutor, and "appointments" contains all of the 
        appointments that the current user is going to.
*/
router.get('/appointments', requireAuth, tutorController.getAppointments);

/*
get: GET request ('/api/user/:id')
function: Returns the user with the specified id.
input: The user id through the URL
output: The user object in the form of a JSON.
*/
router.get('/:id', requireAuth, userController.getUser);

module.exports = router;