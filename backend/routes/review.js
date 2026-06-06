const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Review routes ('/api/review/...')

/*
register: POST request ('/api/review/')
function: Creates a new review and links it with the user being reviewed and the student who wrote the review
input:
output:
*/
router.post('/', reviewController.create);

/*
register: GET request ('/api/review/reviews-received')
function: Get all of the reviews that a specified user has received
input:
output:
*/
router.get('/reviews-received/:userId', reviewController.reviewsReceived);

/*
register: GET request ('/api/review/reviews-issued')
function: Get all of the reviews that a specified user has written
input:
output:
*/
router.get('/reviews-issued/:userId', reviewController.reviewsIssued);

/*
register: DELETE request ('/api/review/:id')
function: Delete a review
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