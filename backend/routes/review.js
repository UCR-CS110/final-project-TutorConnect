const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Review routes ('/api/review/...')

/*
register: POST request ('/api/review/')
function: Creates a new review and links it with the tutor being reviewed and the current 
          student (based on the session id). Updates the average rating of the tutor and adds the 
          review to the list of reviews on the tutor object.
input: JSON body with review information. ex:
    {
        "tutor": "5f6b6b6b6b6b6b6b6b6b6b6b",
        "subject": "Math",
        "rating": 5,
        "comment": "I really enjoyed your tutoring experience!"
    }
output: If successful, returns (message: 'Review created successfully') and the review object in the form of a JSON.
        If not successful, returns error 500. (error: 'Review creation failed').
*/
router.post('/', reviewController.create);

/*
register: GET request ('/api/review/reviews-issued')
function: Get all of the reviews that a specified user has written
input:
output:
*/
router.get('/reviews-issued/:userId', reviewController.reviewsIssued);

/*
register: DELETE request ('/api/review/:id')
function: Delete a review based on the review id
input:
output:
*/
router.delete('/:id', reviewController.delete);

/*
register: PUT request ('/api/review/:id')
function: Edit the information of a review
input:
output:
*/
router.put('/:id', reviewController.update);

/*
register: GET request ('/api/review/:id')
function: Get a specific review from the review's id
input:
output:
*/
router.get('/:id', reviewController.getReview);

module.exports = router;