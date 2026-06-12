const express = require('express');
const router = express.Router();
const studentReviewController = require('../controllers/studentReviewController');
const requireAuth = require('../middleware/auth');

router.post('/', requireAuth, studentReviewController.create);

module.exports = router;
