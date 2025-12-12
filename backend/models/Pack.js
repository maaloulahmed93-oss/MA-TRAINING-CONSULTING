import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  moduleId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  }
});

const themeSchema = new mongoose.Schema({
  themeId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  modules: [moduleSchema]
});

const packDetailsSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number,
    required: true
  },
  savings: {
    type: Number,
    required: true
  },
  advantages: [{
    type: String,
    required: true
  }],
  themes: [themeSchema]
});

const packSchema = new mongoose.Schema({
  packId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  niveau: {
    type: String,
    enum: ['Débutant', 'Intermédiaire', 'Avancé'],
    default: 'Débutant'
  },
  resourcesCount: {
    type: Number,
    default: 0
  },
  details: {
    type: packDetailsSchema,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Pack', packSchema);
