import mongoose from 'mongoose';
import Partner from './models/Partner.js';
import ParticipantFormation from './models/ParticipantFormation.js';
import ParticipantProject from './models/ParticipantProject.js';
import ParticipantResource from './models/ParticipantResource.js';
import ParticipantNotification from './models/ParticipantNotification.js';

// Sample participants with specific IDs that the frontend expects
const sampleParticipants = [
  {
    partnerId: 'PART-2024-001',
    fullName: 'Ahmed Ben Ali',
    email: 'ahmed.benali@email.com',
    phone: '+216 98 123 456',
    address: 'Tunis, Tunisie',
    type: 'participant',
    isActive: true,
    description: JSON.stringify({
      firstName: 'Ahmed',
      lastName: 'Ben Ali',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      notes: 'Participant motivé avec un bon potentiel',
      totalProgress: 75,
      enrollmentDate: '2024-01-15T00:00:00.000Z',
      lastActivity: new Date().toISOString()
    })
  },
  {
    partnerId: 'PART-2024-002',
    fullName: 'Fatima Zahra',
    email: 'fatima.zahra@email.com',
    phone: '+216 97 654 321',
    address: 'Sfax, Tunisie',
    type: 'participant',
    isActive: true,
    description: JSON.stringify({
      firstName: 'Fatima',
      lastName: 'Zahra',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      notes: 'Excellente participante, très assidue',
      totalProgress: 90,
      enrollmentDate: '2024-02-01T00:00:00.000Z',
      lastActivity: new Date().toISOString()
    })
  },
  {
    partnerId: 'PART-2024-003',
    fullName: 'Mohamed Slim',
    email: 'mohamed.slim@email.com',
    phone: '+216 99 888 777',
    address: 'Sousse, Tunisie',
    type: 'participant',
    isActive: true,
    description: JSON.stringify({
      firstName: 'Mohamed',
      lastName: 'Slim',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      notes: 'Participant débutant mais très motivé',
      totalProgress: 45,
      enrollmentDate: '2024-03-10T00:00:00.000Z',
      lastActivity: new Date().toISOString()
    })
  }
];

// Sample formations for participants
const sampleFormations = [
  {
    participantId: 'PART-2024-001',
    title: 'Développement Web Frontend',
    description: 'Formation complète en HTML, CSS, JavaScript et React',
    domain: 'Développement Web',
    level: 'Intermédiaire',
    duration: '120 heures',
    progress: 75,
    status: 'in_progress',
    enrollmentDate: new Date('2024-01-15'),
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300&h=200&fit=crop'
  },
  {
    participantId: 'PART-2024-002',
    title: 'Marketing Digital',
    description: 'Stratégies de marketing numérique et réseaux sociaux',
    domain: 'Marketing',
    level: 'Avancé',
    duration: '80 heures',
    progress: 90,
    status: 'in_progress',
    enrollmentDate: new Date('2024-02-01'),
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop'
  },
  {
    participantId: 'PART-2024-003',
    title: 'Comptabilité et Gestion',
    description: 'Principes de base de la comptabilité d\'entreprise',
    domain: 'Gestion',
    level: 'Débutant',
    duration: '60 heures',
    progress: 45,
    status: 'in_progress',
    enrollmentDate: new Date('2024-03-10'),
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop'
  }
];

async function createSampleParticipants() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ahmedmaaloul93:ahmedmaaloul93@cluster0.mongodb.net/matc-db?retryWrites=true&w=majority');
    console.log('✅ Connected to MongoDB');

    // Remove existing participants with these IDs
    await Partner.deleteMany({ 
      partnerId: { $in: ['PART-2024-001', 'PART-2024-002', 'PART-2024-003'] },
      type: 'participant' 
    });
    console.log('🧹 Cleaned existing participants');

    // Create participants
    console.log('👥 Creating participants...');
    for (const participantData of sampleParticipants) {
      const participant = new Partner(participantData);
      await participant.save();
      console.log(`✅ Created participant: ${participantData.partnerId} - ${participantData.fullName}`);
    }

    // Create formations
    console.log('📚 Creating formations...');
    for (const formationData of sampleFormations) {
      const formation = new ParticipantFormation(formationData);
      await formation.save();
      console.log(`✅ Created formation: ${formationData.title} for ${formationData.participantId}`);
    }

    console.log('\n🎉 Sample participants created successfully!');
    
    // Verify creation
    const participantCount = await Partner.countDocuments({ type: 'participant' });
    const formationCount = await ParticipantFormation.countDocuments();
    
    console.log(`✅ Total participants: ${participantCount}`);
    console.log(`✅ Total formations: ${formationCount}`);

  } catch (error) {
    console.error('❌ Error creating participants:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createSampleParticipants();
