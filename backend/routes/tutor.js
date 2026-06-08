const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');
const requireAuth = require('../middleware/auth');
const requireTutor = require('../middleware/requireTutor');

// Tutor routes ('/api/tutor/...')

/*
register: POST request ('/api/tutor/register')
function: Registers the current user (indicated by the session) as a tutor. This does not 
          work if the user is already registered as a tutor.
input: JSON body with bio, subjects, cost, and related work. Subjects should be an array. ex:
    {
        "bio": "I am a tutor",
        "subjects": ["Math", "Science"],
        "cost": 50,
        "relatedWork": "I teach in a school"
    }
output: If successful, returns (message: 'Tutor registered successfully') and the tutor object in the form of a JSON.
        If not successful, returns error 500. (error: 'Tutor registration failed').
        If the user is already registered as a tutor, returns error 400. (error: 'User is already registered as a tutor').
*/
router.post('/register', requireAuth, tutorController.register);

/*
delete: DELETE request ('/api/tutor/')
function: Deletes the current user (indicated by the session) as a tutor. This does not 
          work if the user is not registered as a tutor. This does not delete the user from the database.
          It just removes the tutor object from the database.
input: nothing
output: If successful, returns (message: 'Tutor deleted successfully').
        If not successful, returns error 500 (error: 'Tutor deletion failed').
        If the user is not registered as a tutor, returns error 404 (error: 'User is not registered as a tutor').
*/
router.delete('/', requireAuth, requireTutor, tutorController.delete);

/*
getInfo: GET request ('/api/tutor/info/:id')
function: Returns the information for the specified tutor.
input: The id of the user who is the tutor that you want to get info for. Tutor is just an extension of user
       so you'll need the user id, not the tutor id. This id should be supplied in the URL
output: The tutor's info in the form of a JSON. ex:
    {
        "bio": "I am a tutor",
        "subjects": ["Math", "Science"],
        "cost": 50,
        "ratingAverage": 4.5,
        "numRatings": 5,
        "relatedWork": "I teach in a school"
    }
*/
router.get('/info/:id', requireAuth, tutorController.getInfo);

/*
getReviews: GET request ('/api/tutor/get-reviews/:id')
function: Returns all of the reviews that the specified tutor has received.
input: Tutor id through the URL
output: An array of review objects ("reviews") in the form of a JSON as well as the average rating ("ratingAverage").
*/
router.get('/get-reviews/:id', requireAuth, tutorController.getReviews);

/*
updateSubjects: PUT request ('/api/tutor/')
function: Updates the tutor information for a user if and only if the current user is a tutor.
input: JSON body with any modification. The valid fields to be modified are "bio", "subjects", "cost", "relatedWork". ex:
    {
        "subjects": ["Math", "Science"]
    }
    or
    {
        "bio": "I am a tutor",
        "cost": 50
    }
    etc.
output: If successful, returns (message: 'Tutor subjects updated successfully') and the tutor object in the form of a JSON.
        If not successful, returns error 500. (error: 'Tutor subjects update failed').
*/
router.put('/', requireAuth, requireTutor, tutorController.update);

/*
get: GET request ('/api/tutor/')
function: Returns the current user (indicated by the session) as a tutor. This does not 
          work if the user is not registered as a tutor.
input: nothing
output: The tutor object in the form of a JSON.
*/
router.get('/', requireAuth, requireTutor, tutorController.get);

module.exports = router;