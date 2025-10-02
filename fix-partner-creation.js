import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Schéma Partner simplifié pour la création
const partnerSchema = new mongoose.Schema({
  partnerId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  type: { type: String, enum: ['Entreprise', 'École'], required: true },
  contactPerson: String,
  phone: String,
  address: String,
  website: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date
});

const Partner = mongoose.model('Partner', partnerSchema);

async function createTestPartner() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const partnerId = 'ENT-752810';
    
    // Vérifier si le partenaire existe déjà
    const existingPartner = await Partner.findOne({ partnerId });
    if (existingPartner) {
      console.log(`✅ Le partenaire ${partnerId} existe déjà:`, existingPartner.fullName);
      return existingPartner;
    }

    // Créer le nouveau partenaire
    const partnerData = {
      partnerId: partnerId,
      fullName: 'Entreprise Test MATC',
      email: 'test@entreprise-matc.com',
      type: 'Entreprise',
      contactPerson: 'Ahmed Maaloul',
      phone: '+33 1 23 45 67 89',
      address: '123 Rue de la Formation, 75001 Paris',
      website: 'https://test-entreprise.com',
      description: 'Entreprise de test pour valider la migration de l\'Espace Entreprise',
      isActive: true
    };

    console.log('📝 Création du partenaire...');
    const newPartner = new Partner(partnerData);
    await newPartner.save();
    
    console.log('✅ Partenaire créé avec succès!');
    console.log(`   ID: ${newPartner.partnerId}`);
    console.log(`   Nom: ${newPartner.fullName}`);
    console.log(`   Email: ${newPartner.email}`);
    console.log(`   Type: ${newPartner.type}`);

    // Test de login
    console.log('\n🔐 Test de login...');
    const loginTest = await Partner.findOne({ partnerId: partnerId.toUpperCase(), isActive: true });
    if (loginTest) {
      console.log('✅ Login test réussi!');
      loginTest.lastLogin = new Date();
      await loginTest.save();
    }

    return newPartner;

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.code === 11000) {
      console.log('⚠️ Le partenaire existe peut-être déjà avec cet ID');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter la création
createTestPartner();
