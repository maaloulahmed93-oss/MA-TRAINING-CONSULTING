import mongoose from 'mongoose';
import Partner from './models/Partner.js';
import ParticipantFormation from './models/ParticipantFormation.js';
import ParticipantProject from './models/ParticipantProject.js';
import ParticipantResource from './models/ParticipantResource.js';
import ParticipantNotification from './models/ParticipantNotification.js';

// Sample participant data
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
  // Ahmed's formations
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
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300&h=200&fit=crop',
    courses: [
      {
        id: 'course-1',
        title: 'Fondamentaux HTML/CSS',
        description: 'Apprendre les bases du HTML et CSS',
        progress: 100,
        isCompleted: true,
        duration: '20 heures',
        modules: [
          {
            id: 'module-1',
            title: 'Introduction au HTML',
            description: 'Structure de base d\'une page web',
            duration: '2 heures',
            isCompleted: true,
            isLocked: false,
            type: 'video'
          }
        ]
      },
      {
        id: 'course-2',
        title: 'JavaScript Moderne',
        description: 'ES6+ et concepts avancés',
        progress: 60,
        isCompleted: false,
        duration: '40 heures'
      }
    ]
  },
  // Fatima's formations
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
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop',
    courses: [
      {
        id: 'course-3',
        title: 'SEO et référencement',
        description: 'Optimisation pour les moteurs de recherche',
        progress: 100,
        isCompleted: true,
        duration: '25 heures'
      },
      {
        id: 'course-4',
        title: 'Publicité Facebook',
        description: 'Création et gestion de campagnes publicitaires',
        progress: 80,
        isCompleted: false,
        duration: '30 heures'
      }
    ]
  },
  // Mohamed's formations
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
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop',
    courses: [
      {
        id: 'course-5',
        title: 'Introduction à la comptabilité',
        description: 'Concepts de base et terminologie',
        progress: 70,
        isCompleted: false,
        duration: '20 heures'
      }
    ]
  }
];

// Sample projects
const sampleProjects = [
  {
    participantId: 'PART-2024-001',
    title: 'Site E-commerce React',
    description: 'Développement d\'une boutique en ligne avec React et Node.js',
    formationId: 'formation-1',
    formationTitle: 'Développement Web Frontend',
    status: 'in_progress',
    dueDate: new Date('2024-06-15'),
    files: [
      {
        id: 'file-1',
        name: 'projet-ecommerce.zip',
        size: '2.5 MB',
        type: 'application/zip',
        uploadDate: new Date()
      }
    ]
  },
  {
    participantId: 'PART-2024-002',
    title: 'Stratégie Marketing Digital',
    description: 'Plan marketing complet pour une startup',
    formationId: 'formation-2',
    formationTitle: 'Marketing Digital',
    status: 'submitted',
    submittedDate: new Date('2024-04-20'),
    grade: 18,
    feedback: 'Excellent travail, stratégie bien structurée'
  }
];

// Sample coaching resources
const sampleResources = [
  {
    participantId: 'PART-2024-001',
    title: 'CV Template Développeur',
    description: 'Modèle de CV optimisé pour les développeurs web',
    type: 'CV Template',
    category: 'Templates',
    thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=200&fit=crop',
    downloadUrl: '/resources/cv-template-dev.pdf',
    assignedDate: new Date('2024-01-20'),
    isCompleted: false
  },
  {
    participantId: 'PART-2024-002',
    title: 'Guide Marketing B2B',
    description: 'Stratégies marketing pour les entreprises B2B',
    type: 'Guide',
    category: 'Marketing',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=200&fit=crop',
    assignedDate: new Date('2024-02-05'),
    isCompleted: true
  }
];

// Sample notifications
const sampleNotifications = [
  {
    participantId: 'PART-2024-001',
    title: 'Nouveau cours disponible',
    message: 'Le cours "React Avancé" est maintenant disponible dans votre formation.',
    type: 'info',
    date: new Date(),
    isRead: false
  },
  {
    participantId: 'PART-2024-002',
    title: 'Opportunité d\'emploi',
    message: 'Une nouvelle offre d\'emploi correspond à votre profil.',
    type: 'job',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: false,
    company: 'TechStart Tunisia',
    jobTitle: 'Marketing Manager',
    salary: '2500-3500 TND'
  },
  {
    participantId: 'PART-2024-003',
    title: 'Rappel de session',
    message: 'Votre session de coaching est prévue demain à 14h00.',
    type: 'warning',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: true
  }
];

async function migrateParticipantData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ahmedmaaloul93:ahmedmaaloul93@cluster0.mongodb.net/matc-db?retryWrites=true&w=majority');
    console.log('✅ Connected to MongoDB');

    // Clear existing participant data
    console.log('🧹 Clearing existing participant data...');
    await Partner.deleteMany({ type: 'participant' });
    await ParticipantFormation.deleteMany({});
    await ParticipantProject.deleteMany({});
    await ParticipantResource.deleteMany({});
    await ParticipantNotification.deleteMany({});

    // Insert participants
    console.log('👥 Inserting participants...');
    for (const participantData of sampleParticipants) {
      const participant = new Partner(participantData);
      await participant.save();
      console.log(`✅ Created participant: ${participantData.partnerId} - ${participantData.fullName}`);
    }

    // Insert formations
    console.log('📚 Inserting formations...');
    for (const formationData of sampleFormations) {
      const formation = new ParticipantFormation(formationData);
      await formation.save();
      console.log(`✅ Created formation: ${formationData.title} for ${formationData.participantId}`);
    }

    // Insert projects
    console.log('📁 Inserting projects...');
    for (const projectData of sampleProjects) {
      const project = new ParticipantProject(projectData);
      await project.save();
      console.log(`✅ Created project: ${projectData.title} for ${projectData.participantId}`);
    }

    // Insert coaching resources
    console.log('📖 Inserting coaching resources...');
    for (const resourceData of sampleResources) {
      const resource = new ParticipantResource(resourceData);
      await resource.save();
      console.log(`✅ Created resource: ${resourceData.title} for ${resourceData.participantId}`);
    }

    // Insert notifications
    console.log('🔔 Inserting notifications...');
    for (const notificationData of sampleNotifications) {
      const notification = new ParticipantNotification(notificationData);
      await notification.save();
      console.log(`✅ Created notification: ${notificationData.title} for ${notificationData.participantId}`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${sampleParticipants.length} participants created`);
    console.log(`- ${sampleFormations.length} formations created`);
    console.log(`- ${sampleProjects.length} projects created`);
    console.log(`- ${sampleResources.length} coaching resources created`);
    console.log(`- ${sampleNotifications.length} notifications created`);

    // Verify data
    console.log('\n🔍 Verifying data...');
    const participantCount = await Partner.countDocuments({ type: 'participant' });
    const formationCount = await ParticipantFormation.countDocuments();
    const projectCount = await ParticipantProject.countDocuments();
    const resourceCount = await ParticipantResource.countDocuments();
    const notificationCount = await ParticipantNotification.countDocuments();

    console.log(`✅ Participants in DB: ${participantCount}`);
    console.log(`✅ Formations in DB: ${formationCount}`);
    console.log(`✅ Projects in DB: ${projectCount}`);
    console.log(`✅ Resources in DB: ${resourceCount}`);
    console.log(`✅ Notifications in DB: ${notificationCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration
migrateParticipantData();
