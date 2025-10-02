import mongoose from 'mongoose';

const participantResourceSchema = new mongoose.Schema({
  // Owner field - critical for data isolation
  participantId: {
    type: String,
    required: true,
    index: true
  },
  
  // Resource basic info
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  // Resource URL - for direct links
  url: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty URLs
        
        // Reject URLs containing console logs or debug info
        const invalidPatterns = [
          /chunk-YQ5BCTVV\.js/i,
          /ParticipantFormEnhanced\.tsx/i,
          /Download the React DevTools/i,
          /console\.log/i,
          /📦.*module loaded/i,
          /🔄.*Chargement/i,
          /✅.*programmes chargés/i,
          /❌.*Erreur/i
        ];
        
        return !invalidPatterns.some(pattern => pattern.test(v));
      },
      message: 'URL contains invalid debug information'
    }
  },
  
  // Resource icon - for display
  icon: {
    type: String,
    trim: true
  },
  
  type: {
    type: String,
    enum: ['CV Template', 'Lettre de motivation', 'Vidéo Soft Skills', 'Guide', 'Jeux Éducatifs', 'Scénarios', 'Bibliothèque Online', 'Podcast', 'Atelier Interactif', 'Cas d\'Etude', 'Webinaire', 'Outils'],
    default: 'Guide'
  },
  
  category: {
    type: String,
    enum: ['Templates', 'Soft Skills', 'Carrière', 'Ressources', 'Marketing', 'Innovation', 'Productivité'],
    default: 'Ressources'
  },
  
  thumbnail: {
    type: String
  },
  
  downloadUrl: {
    type: String
  },
  
  duration: {
    type: String
  },
  
  assignedDate: {
    type: Date,
    default: Date.now
  },
  
  accessedDate: {
    type: Date
  },
  
  isCompleted: {
    type: Boolean,
    default: false
  },
  
  // Additional data links
  dataLinks: [{
    id: String,
    title: String,
    url: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty URLs
          
          // Reject URLs containing console logs or debug info
          const invalidPatterns = [
            /chunk-YQ5BCTVV\.js/i,
            /ParticipantFormEnhanced\.tsx/i,
            /Download the React DevTools/i,
            /console\.log/i,
            /📦.*module loaded/i,
            /🔄.*Chargement/i,
            /✅.*programmes chargés/i,
            /❌.*Erreur/i
          ];
          
          return !invalidPatterns.some(pattern => pattern.test(v));
        },
        message: 'DataLink URL contains invalid debug information'
      }
    },
    type: {
      type: String,
      enum: ['video', 'document', 'resource', 'exercise', 'download', 'external', 'action', 'interactive'],
      default: 'resource'
    },
    description: String,
    duration: String,
    fileSize: String
  }],
  
  // Active status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
participantResourceSchema.index({ participantId: 1, category: 1 });
participantResourceSchema.index({ participantId: 1, type: 1 });
participantResourceSchema.index({ participantId: 1, assignedDate: -1 });

const ParticipantResource = mongoose.model('ParticipantResource', participantResourceSchema);

export default ParticipantResource;
