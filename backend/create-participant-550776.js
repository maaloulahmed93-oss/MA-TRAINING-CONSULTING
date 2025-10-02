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

async function createParticipantIsmael() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const participantId = 'PART-550776';

    // Vérifier si le participant existe déjà
    const existingParticipant = await Partner.findOne({ partnerId: participantId });
    if (existingParticipant) {
      console.log(`✅ Participant ${participantId} existe déjà:`, existingParticipant.fullName);
      return;
    }

    // Créer le participant Ismael Gharbi
    console.log(`🔄 Création du participant ${participantId} - Ismael Gharbi...`);
    const participant = new Partner({
      partnerId: participantId,
      type: 'participant',
      fullName: 'Ismael Gharbi',
      email: 'gharbi@gmail.com',
      phone: '+216 98 765 432',
      isActive: true,
      description: JSON.stringify({
        status: 'active',
        joinDate: new Date().toISOString(),
        program: 'Formation Marketing Digital',
        level: 'Débutant',
        specialization: 'Marketing & Communication'
      })
    });

    await participant.save();
    console.log('✅ Participant Ismael Gharbi créé avec succès');

    // Créer une formation Marketing
    console.log('🔄 Création formation Marketing...');
    const formation = new ParticipantFormation({
      participantId: participantId,
      title: 'Formation Marketing Digital Avancé',
      description: 'Formation complète en marketing digital incluant SEO, SEM, réseaux sociaux et analytics',
      startDate: '2024-01-10',
      endDate: '2024-05-10',
      status: 'en_cours',
      progress: 35,
      instructor: 'Sarah Ben Ahmed',
      modules: [
        'Introduction au Marketing Digital',
        'SEO et Référencement',
        'Google Ads et SEM',
        'Réseaux Sociaux',
        'Email Marketing',
        'Analytics et Mesure'
      ]
    });

    await formation.save();
    console.log('✅ Formation Marketing créée avec succès');

    // Créer un projet Marketing
    console.log('🔄 Création projet Marketing...');
    const project = new ParticipantProject({
      participantId: participantId,
      title: 'Campagne Marketing MATC',
      description: 'Développement d\'une campagne marketing complète pour promouvoir les services MATC',
      status: 'en_cours',
      progress: 25,
      startDate: '2024-02-15',
      endDate: '2024-04-15',
      technologies: ['Google Analytics', 'Facebook Ads', 'Canva', 'Mailchimp'],
      projectUrl: 'https://drive.google.com/ismael-marketing-campaign'
    });

    await project.save();
    console.log('✅ Projet Marketing créé avec succès');

    // Créer une deuxième formation en Communication
    console.log('🔄 Création formation Communication...');
    const formation2 = new ParticipantFormation({
      participantId: participantId,
      title: 'Communication Digitale et Stratégie',
      description: 'Formation en communication digitale, stratégie de contenu et gestion de communauté',
      startDate: '2024-03-01',
      endDate: '2024-06-01',
      status: 'en_cours',
      progress: 15,
      instructor: 'Mohamed Trabelsi',
      modules: [
        'Stratégie de Communication',
        'Création de Contenu',
        'Community Management',
        'Influence Marketing',
        'Gestion de Crise'
      ]
    });

    await formation2.save();
    console.log('✅ Formation Communication créée avec succès');

    // Vérification finale
    console.log('\n📊 Vérification des données créées pour Ismael Gharbi:');
    const createdParticipant = await Partner.findOne({ partnerId: participantId });
    const formations = await ParticipantFormation.find({ participantId: participantId });
    const projects = await ParticipantProject.find({ participantId: participantId });

    console.log(`👤 Participant: ${createdParticipant.fullName}`);
    console.log(`📧 Email: ${createdParticipant.email}`);
    console.log(`📚 Formations: ${formations.length}`);
    formations.forEach((f, i) => {
      console.log(`   ${i+1}. ${f.title} - ${f.progress}% (${f.status})`);
    });
    console.log(`📋 Projets: ${projects.length}`);
    projects.forEach((p, i) => {
      console.log(`   ${i+1}. ${p.title} - ${p.progress}% (${p.status})`);
    });

    console.log('\n🎉 Participant Ismael Gharbi (PART-550776) créé avec succès!');
    console.log('🔗 Identifiants de connexion:');
    console.log(`   ID: ${participantId}`);
    console.log(`   Email: gharbi@gmail.com`);
    console.log('🌐 URL: http://localhost:5173/espace-participant');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
createParticipantIsmael();
