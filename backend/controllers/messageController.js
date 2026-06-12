const Message = require('../models/Message');
const User = require('../models/User');

exports.getConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.session.userId },
        { recipient: req.session.userId }
      ]
    }).sort({ createdAt: -1 });

    const partnerIds = [...new Set(messages.map((message) => (
      message.sender.toString() === req.session.userId
        ? message.recipient.toString()
        : message.sender.toString()
    )))];

    const users = await User.find({ _id: { $in: partnerIds } }).select('username email role school ratingAverage numRatings');

    res.status(200).json({ conversations: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Conversation retrieval failed', details: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const partnerId = req.params.userId;
    const messages = await Message.find({
      $or: [
        { sender: req.session.userId, recipient: partnerId },
        { sender: partnerId, recipient: req.session.userId }
      ]
    }).sort({ createdAt: 1 });

    const partner = await User.findOne({ _id: partnerId }).select('username email role school ratingAverage numRatings');

    res.status(200).json({ messages: messages, partner: partner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Message retrieval failed', details: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { recipientId, body } = req.body;

    if (!recipientId || !body || !body.trim()) {
      return res.status(400).json({ error: 'Recipient and message are required' });
    }

    const recipient = await User.findOne({ _id: recipientId });
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const message = await Message.create({
      sender: req.session.userId,
      recipient: recipientId,
      body: body.trim()
    });

    res.status(201).json({ message: message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Message creation failed', details: error.message });
  }
};
