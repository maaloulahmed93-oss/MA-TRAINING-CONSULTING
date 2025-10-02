// Debug: Pourquoi le partenaire n'est pas trouvé
import mongoose from 'mongoose';
import Partner from './models/Partner.js';

const mongoURI = 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db?retryWrites=true&w=majority&appName=matc';

async function debugPartnerIssue() {
    try {
        console.log('🔍 Connexion à MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ Connecté à MongoDB');
        
        console.log('\n📊 Recherche du partenaire ENT-TESTDIAG...');
        
        // Recherche exacte
        const partner1 = await Partner.findOne({ partnerId: 'ENT-TESTDIAG' });
        console.log('Recherche exacte:', partner1 ? '✅ Trouvé' : '❌ Non trouvé');
        
        // Recherche avec toUpperCase (comme dans le middleware)
        const partner2 = await Partner.findOne({ partnerId: 'ENT-TESTDIAG'.toUpperCase() });
        console.log('Recherche uppercase:', partner2 ? '✅ Trouvé' : '❌ Non trouvé');
        
        // Recherche avec isActive
        const partner3 = await Partner.findOne({ 
            partnerId: 'ENT-TESTDIAG'.toUpperCase(), 
            isActive: true 
        });
        console.log('Recherche avec isActive:', partner3 ? '✅ Trouvé' : '❌ Non trouvé');
        
        // Lister tous les partenaires entreprise
        console.log('\n📋 Liste des partenaires entreprise:');
        const allPartners = await Partner.find({ type: 'entreprise' }).select('partnerId fullName isActive');
        
        if (allPartners.length === 0) {
            console.log('❌ Aucun partenaire entreprise trouvé!');
        } else {
            allPartners.forEach(p => {
                console.log(`- ${p.partnerId} | ${p.fullName} | Active: ${p.isActive}`);
            });
        }
        
        // Vérifier si ENT-TESTDIAG existe vraiment
        const testPartner = await Partner.findOne({ partnerId: { $regex: 'TESTDIAG', $options: 'i' } });
        if (testPartner) {
            console.log('\n🔍 Partenaire test trouvé:');
            console.log('- ID:', testPartner.partnerId);
            console.log('- Nom:', testPartner.fullName);
            console.log('- Type:', testPartner.type);
            console.log('- Actif:', testPartner.isActive);
            console.log('- Email:', testPartner.email);
        }
        
        await mongoose.disconnect();
        console.log('\n✅ Diagnostic terminé');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

debugPartnerIssue();
