const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const requireAuth = require('../middleware/auth');

// Review routes ('/api/review/...')

/*
create: POST request ('/api/review/')
function: Creates a new review and links it with the tutor being reviewed and the current 
          student (based on the session id). Updates the average rating of the tutor and adds the 
          review to the list of reviews on the tutor object.
input: JSON body with review information. ex:
    {
        "tutorId": "5f6b6b6b6b6b6b6b6b6b6b6b",
        "subject": "Math",
        "rating": 5,
        "comment": "I really enjoyed your tutoring experience!"
    }
output: If successful, returns (message: 'Review created successfully') and the review object in the form of a JSON.
        If not successful, returns error 500. (error: 'Review creation failed').
*/
router.post('/', requireAuth, reviewController.create);

/*
reviewsIssued: GET request ('/api/review/reviews-issued' or '/api/review/reviews-issued/:userId')
function: Get all of the reviews that a specified user has written. If a user id is not provided, 
          it will use the current user based on the session.
input: User id through the URL
output: An array of review objects ("reviews") in the form of a JSON.
*/
router.get('/reviews-issued', requireAuth, reviewController.reviewsIssued);
router.get('/reviews-issued/:userId', requireAuth, reviewController.reviewsIssued);

/*
delete: DELETE request ('/api/review/:id')
function: Delete a review based on the review id. This will not work if the user did not write the review in question.
input: The id of the review in the URL.
output: If successful, returns (message: 'Review deleted successfully').
        If not successful, returns error 500 (error: 'Review deletion failed').
*/
router.delete('/:id', requireAuth, reviewController.delete);

/*
update: PUT request ('/api/review/:id')
function: Edit the information of a review. Doesn't work if the user didn't write the review. If the rating is changed,
          it will update the average rating of the tutor.
input: The id of the review in the URL as well as a JSON on the new review. Only the rating and the comment
       can be modified. The tutor and subject cannot be modified. Ex:
    {
        "rating": 5,
        "comment": "I really enjoyed your tutoring experience!"
    }
output: If successful, returns (message: 'Review updated successfully') and the review object in the form of a JSON.
        If not successful, returns error 500. (error: 'Review update failed').
*/
router.put('/:id', requireAuth, reviewController.update);

/*
getReview: GET request ('/api/review/:id')
function: Get a specific review from the review's id
input: The review's id in the URL.
output: The review object in the form of a JSON.
*/
router.get('/:id', reviewController.getReview);

module.exports = router;