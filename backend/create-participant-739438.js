import mongoose from 'mongoose';

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db';

// Partner model (simplified)
const partnerSchema = new mongoose.Schema({
  partnerId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['entreprise', 'formateur', 'participant', 'freelancer'], required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  isActive: { type: Boolean, default: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Partner = mongoose.model('Partner', partnerSchema);

// ParticipantFormation model
const participantFormationSchema = new mongoose.Schema({
  participantId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: String,
  startDate: String,
  endDate: String,
  status: { type: String, enum: ['en_cours', 'termine', 'suspendu'], default: 'en_cours' },
  progress: { type: Number, default: 0 },
  instructor: String,
  modules: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ParticipantFormation = mongoose.model('ParticipantFormation', participantFormationSchema);

// ParticipantProject model
const participantProjectSchema = new mongoose.Schema({
  participantId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['en_cours', 'termine', 'suspendu'], default: 'en_cours' },
  progress: { type: Number, default: 0 },
  startDate: String,
  endDate: String,
  technologies: [String],
  projectUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ParticipantProject = mongoose.model('ParticipantProject', participantProjectSchema);

async function createParticipant() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const participantId = 'PART-739438';

    // Vérifier si le participant existe déjà
    const existingParticipant = await Partner.findOne({ partnerId: participantId });
    if (existingParticipant) {
      console.log(`✅ Participant ${participantId} existe déjà:`, existingParticipant.fullName);
      return;
    }

    // Créer le participant
    console.log(`🔄 Création du participant ${participantId}...`);
    const participant = new Partner({
      partnerId: participantId,
      type: 'participant',
      fullName: 'Ahmed Participant Test',
      email: 'ahmed.participant@matc.com',
      phone: '+216 12 345 678',
      isActive: true,
      description: JSON.stringify({
        status: 'active',
        joinDate: new Date().toISOString(),
        program: 'Formation Développement Web'
      })
    });

    await participant.save();
    console.log('✅ Participant créé avec succès');

    // Créer une formation de test
    console.log('🔄 Création formation de test...');
    const formation = new ParticipantFormation({
      participantId: participantId,
      title: 'Formation Développement Web Full Stack',
      description: 'Formation complète en développement web moderne avec React, Node.js et MongoDB',
      startDate: '2024-01-15',
      endDate: '2024-06-15',
      status: 'en_cours',
      progress: 65,
      instructor: 'Mohamed Ben Salem',
      modules: ['HTML/CSS', 'JavaScript ES6+', 'React.js', 'Node.js', 'MongoDB', 'Déploiement']
    });

    await formation.save();
    console.log('✅ Formation créée avec succès');

    // Créer un projet de test
    console.log('🔄 Création projet de test...');
    const project = new ParticipantProject({
      participantId: participantId,
      title: 'Application E-commerce MATC',
      description: 'Développement d\'une application e-commerce complète avec panier, paiement et gestion des commandes',
      status: 'en_cours',
      progress: 45,
      startDate: '2024-02-01',
      endDate: '2024-05-01',
      technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe API'],
      projectUrl: 'https://github.com/ahmed-participant/matc-ecommerce'
    });

    await project.save();
    console.log('✅ Projet créé avec succès');

    // Vérification finale
    console.log('\n📊 Vérification des données créées:');
    const createdParticipant = await Partner.findOne({ partnerId: participantId });
    const formations = await ParticipantFormation.find({ participantId: participantId });
    const projects = await ParticipantProject.find({ participantId: participantId });

    console.log(`👤 Participant: ${createdParticipant.fullName}`);
    console.log(`📚 Formations: ${formations.length}`);
    console.log(`📋 Projets: ${projects.length}`);

    console.log('\n🎉 Participant PART-739438 créé avec succès avec des données de test!');
    console.log('🔗 Vous pouvez maintenant vous connecter sur: http://localhost:5173/espace-participant');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
createParticipant();
