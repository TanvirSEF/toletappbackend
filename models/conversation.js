const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
  ],
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'property',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'booking',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('conversation', conversationSchema);
