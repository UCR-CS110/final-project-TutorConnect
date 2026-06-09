const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const requireAuth = require('../middleware/auth');
const requireTutor = require('../middleware/requireTutor');

// Availability routes ('/api/availability/...')

/*
create: POST request ('/api/availability/')
function: Creates a new availability with the specified info. Only works if the current user is a tutor.
input: JSON body with availability information. "meetingType" can only be one of "online", "in-person", or "both". 
       Only the meetingType is optional. ex:
    {
        "day": "Monday",
        "startTime": "10:00am",
        "endTime": "12:00pm",
        "meetingType": "in-person"
    }
output: a JSON of the availability object that was just created.
*/
router.post('/', requireAuth, requireTutor, availabilityController.create);

/*
getAll: GET request ('/api/availability/see-all')
function: Returns all of the availabilities for the current user (indicated by the session). Only works if they're a tutor.
input: nothing
output: An array of availability objects ("availabilities") in the form of a JSON.
*/
router.get('/see-all', requireAuth, requireTutor, availabilityController.getAll);

/*
delete: DELETE request ('/api/availability/:id')
function: Delete an availability based on the availability id. Only works if the current user is a tutor and if the
          availability belongs to them.
input: The id of the availability in the URL.
output: If successful, returns (message: 'Availability deleted successfully').
        If not successful, returns error 500 (error: 'Availability deletion failed').
*/
router.delete('/:id', requireAuth, requireTutor, availabilityController.delete);

/*
update: PUT request ('/api/availability/:id')
function: Edit the information of an availability. Only works if the current user is a tutor and if the availability
          belongs to them.
input: The id of the availability in the URL as well as a JSON on the new availability. Only the day, start time,
       end time, and meeting type can be modified. Input validation is not done. Ex:
    {
        "day": "Monday",
        "startTime": "10:00am",
        "endTime": "12:00pm",
        "meetingType": "in-person"
    }
output: If successful, returns (message: 'Availability updated successfully') and the availability object in the form of a JSON.
        If not successful, returns error 500. (error: 'Availability update failed').
*/
router.put('/:id', requireAuth, requireTutor, availabilityController.update);

module.exports = router;