import mongoose from 'mongoose';

const participantNotificationSchema = new mongoose.Schema({
  participantId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: false
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['information'],
    default: 'information'
  },
  date: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    required: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  // Legacy job notification fields
  company: {
    type: String,
    required: false
  },
  jobTitle: {
    type: String,
    required: false
  },
  salary: {
    type: String,
    required: false
  },
  contractType: {
    type: String,
    required: false
  },
  contact: {
    type: String,
    required: false
  },
  environment: {
    type: String,
    required: false
  },
  benefits: {
    type: String,
    required: false
  },
  // New notification type fields
  description: {
    type: String,
    required: false
  },
  link: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false
  },
  uploadLink: {
    type: String,
    required: false
  },
  dataLinks: [{
    id: String,
    title: String,
    url: String,
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
participantNotificationSchema.index({ participantId: 1, date: -1 });
participantNotificationSchema.index({ participantId: 1, isRead: 1 });

export default mongoose.model('ParticipantNotification', participantNotificationSchema);
