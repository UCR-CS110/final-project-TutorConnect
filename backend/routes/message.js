const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const requireAuth = require('../middleware/auth');

router.get('/conversations', requireAuth, messageController.getConversations);
router.get('/:userId', requireAuth, messageController.getMessages);
router.post('/', requireAuth, messageController.create);

module.exports = router;
