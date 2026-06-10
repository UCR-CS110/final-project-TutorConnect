const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
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
output: The list of appointments for the current user in the form of a JSON.
*/
router.get('/appointments', requireAuth, userController.getAppointments);

module.exports = router;