import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  status: {
    type: String,
    enum: ['subscribed', 'unsubscribed'],
    default: 'subscribed'
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  },
  source: {
    type: String,
    enum: ['website', 'admin', 'api'],
    default: 'website'
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Index for better performance
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ status: 1 });
newsletterSchema.index({ createdAt: -1 });

// Virtual for display name
newsletterSchema.virtual('displayStatus').get(function() {
  return this.status === 'subscribed' ? 'Abonné' : 'Désabonné';
});

// Method to subscribe
newsletterSchema.methods.subscribe = function() {
  this.status = 'subscribed';
  this.subscribedAt = new Date();
  this.unsubscribedAt = undefined;
  return this.save();
};

// Method to unsubscribe
newsletterSchema.methods.unsubscribe = function() {
  this.status = 'unsubscribed';
  this.unsubscribedAt = new Date();
  return this.save();
};

// Static method to find or create subscriber
newsletterSchema.statics.findOrCreateSubscriber = async function(email, source = 'website') {
  let subscriber = await this.findOne({ email: email.toLowerCase() });
  
  if (!subscriber) {
    subscriber = new this({
      email: email.toLowerCase(),
      status: 'subscribed',
      source
    });
    await subscriber.save();
  } else if (subscriber.status === 'unsubscribed') {
    // Re-subscribe if previously unsubscribed
    await subscriber.subscribe();
  }
  
  return subscriber;
};

export default mongoose.model('Newsletter', newsletterSchema);
