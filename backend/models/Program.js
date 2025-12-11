import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  }
});

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  }
});

const programSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  level: {
    type: String,
    required: true,
    enum: ['Débutant', 'Intermédiaire', 'Avancé'],
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  maxParticipants: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    default: 10
  },
  sessionsPerYear: {
    type: Number,
    required: true,
    min: 1
  },
  modules: [moduleSchema],
  sessions: [sessionSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
programSchema.index({ category: 1, level: 1 });
programSchema.index({ title: 'text', description: 'text' });

const Program = mongoose.model('Program', programSchema);

export default Program;
