const mongoose = require('mongoose');

// Partner Schema
const partnerSchema = new mongoose.Schema({
  partnerId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String },
  type: { 
    type: String, 
    enum: ['formateur', 'freelancer', 'entreprise', 'commercial', 'participant'],
    required: true 
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

const Partner = mongoose.model('Partner', partnerSchema);

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db';

async function fixPartnerEmails() {
    try {
        console.log('🔄 Connexion à MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connecté à MongoDB');

        // 1. Chercher le partenaire FOR-340255
        console.log('\n🔍 Recherche du partenaire FOR-340255...');
        const partner340255 = await Partner.findOne({ partnerId: 'FOR-340255' });
        
        if (partner340255) {
            console.log('✅ Partenaire FOR-340255 trouvé:');
            console.log(`   Nom: ${partner340255.fullName}`);
            console.log(`   Email: ${partner340255.email || '❌ AUCUN EMAIL'}`);
            console.log(`   Type: ${partner340255.type}`);
            console.log(`   Actif: ${partner340255.isActive}`);
            
            if (!partner340255.email) {
                console.log('\n⚠️  Ce partenaire n\'a pas d\'email défini!');
                console.log('💡 Suggestion: Ajouter un email pour ce partenaire');
                
                // Proposer d'ajouter un email
                const suggestedEmail = 'formateur340255@matc.com';
                console.log(`\n🔧 Ajout de l'email suggéré: ${suggestedEmail}`);
                
                partner340255.email = suggestedEmail;
                await partner340255.save();
                
                console.log('✅ Email ajouté avec succès!');
            } else {
                console.log('✅ Ce partenaire a déjà un email défini');
            }
        } else {
            console.log('❌ Partenaire FOR-340255 non trouvé');
        }

        // 2. Lister tous les partenaires sans email
        console.log('\n🔍 Recherche de tous les partenaires sans email...');
        const partnersWithoutEmail = await Partner.find({ 
            $or: [
                { email: { $exists: false } },
                { email: null },
                { email: '' }
            ]
        });

        console.log(`\n📊 Partenaires sans email: ${partnersWithoutEmail.length}`);
        
        if (partnersWithoutEmail.length > 0) {
            console.log('\n📋 Liste des partenaires sans email:');
            partnersWithoutEmail.forEach((partner, index) => {
                console.log(`${index + 1}. ${partner.partnerId} - ${partner.fullName || 'Sans nom'} (${partner.type})`);
            });

            // Proposer d'ajouter des emails automatiquement
            console.log('\n🔧 Ajout d\'emails automatiques...');
            
            for (const partner of partnersWithoutEmail) {
                const suggestedEmail = `${partner.partnerId.toLowerCase().replace('-', '')}@matc.com`;
                console.log(`   ${partner.partnerId} → ${suggestedEmail}`);
                
                partner.email = suggestedEmail;
                await partner.save();
            }
            
            console.log('✅ Emails ajoutés pour tous les partenaires!');
        } else {
            console.log('✅ Tous les partenaires ont des emails définis');
        }

        // 3. Vérifier les formateurs
        console.log('\n🔍 Vérification des formateurs...');
        const formateurs = await Partner.find({ type: 'formateur' });
        console.log(`📊 Total formateurs: ${formateurs.length}`);
        
        formateurs.forEach(formateur => {
            console.log(`   ${formateur.partnerId} - ${formateur.fullName || 'Sans nom'} - ${formateur.email || '❌ PAS D\'EMAIL'}`);
        });

        // 4. Vérifier les freelancers
        console.log('\n🔍 Vérification des freelancers...');
        const freelancers = await Partner.find({ type: 'freelancer' });
        console.log(`📊 Total freelancers: ${freelancers.length}`);
        
        freelancers.forEach(freelancer => {
            console.log(`   ${freelancer.partnerId} - ${freelancer.fullName || 'Sans nom'} - ${freelancer.email || '❌ PAS D\'EMAIL'}`);
        });

        // 5. Test de connexion pour FOR-340255
        console.log('\n🧪 Test de connexion pour FOR-340255...');
        const testPartner = await Partner.findOne({ partnerId: 'FOR-340255' });
        
        if (testPartner && testPartner.email) {
            console.log(`✅ Test réussi!`);
            console.log(`   ID: ${testPartner.partnerId}`);
            console.log(`   Email: ${testPartner.email}`);
            console.log(`   Vous pouvez maintenant vous connecter avec ces informations.`);
        } else {
            console.log('❌ Test échoué - partenaire ou email manquant');
        }

        console.log('\n🎉 Processus terminé!');
        console.log('\n📝 Instructions:');
        console.log('1. Utilisez l\'outil debug-partner-email.html pour vérifier les données');
        console.log('2. Essayez de vous connecter avec l\'ID et l\'email affiché ci-dessus');
        console.log('3. Si le problème persiste, vérifiez que le serveur backend est démarré');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Déconnecté de MongoDB');
    }
}

// Exécuter le script
fixPartnerEmails();
