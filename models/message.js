const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('message', messageSchema);
