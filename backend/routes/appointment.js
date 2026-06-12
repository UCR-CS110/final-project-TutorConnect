const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const requireAuth = require('../middleware/auth');

// Appointment routes ('/api/appointment/...')

/*
create: POST request ('/api/appointment/')
function: Creates a new appointment with the specified info.
input: JSON body with appointment information. All fields are mandatory except for date which will default to
       two weeks from now. The date must be in the format YYYY-MM-DD. Location can only be "online" or "in-person". ex:
    {
        "tutorId": "5f6b6b6b6b6b6b6b6b6b6b6b",
        "date": "2026-12-30",
        "startTime": "10:00am",
        "endTime": "12:00pm",
        "location": "online",
        "subject": "Math"
    }
output: a JSON of the appointment object that was just created.
*/
router.post('/', requireAuth, appointmentController.create);

/*
getAppointment: GET request ('/api/appointment/:id')
function: Returns the appointment with the specified id.
input: The appointment id through the URL
output: A JSON of the appointment object.
*/
router.get('/:id', requireAuth, appointmentController.getAppointment);

/*
delete: DELETE request ('/api/appointment/:id')
function: Deletes the appointment with the specified id. Only works if the current user is either 
          the student or the tutor of the appointment.
input: The appointment id through the URL
output: If successful, returns (message: 'Appointment deleted successfully').
        If not successful, returns error 500 (error: 'Appointment deletion failed').
*/
router.delete('/:id', requireAuth, appointmentController.delete);

/*
update: PUT request ('/api/appointment/:id')
function: Edits the information of an appointment. Only works if the current user is either 
          the student or the tutor of the appointment.
input: The id of the appointment in the URL as well as a JSON on the new appointment. Only the date, start time,
       end time, location, subject, and confirmed can be modified. Confirmed can only be true or false (no quotes).
       Input validation is done only on the date and confirmed. Ex:
    {
        "startTime": "10:30am",
        "endTime": "12:30pm",
        "meetingType": "in-person"
    }
        or
    {
        "date": "2027-12-30"
    }

        or
    {
        "confirmed": true
    }
output: If successful, returns (message: 'Appointment updated successfully') and the appointment object in the form of a JSON.
        If not successful, returns error 500. (error: 'Appointment update failed').
*/
router.put('/:id', requireAuth, appointmentController.update);

module.exports = router;