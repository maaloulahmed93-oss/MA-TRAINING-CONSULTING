const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  situation: {
    type: String,
    required: true,
    trim: true
  },
  documentLink: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ParticipantSimple', participantSchema);
