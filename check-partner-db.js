import mongoose from 'mongoose';
import Partner from './backend/models/Partner.js';

async function checkPartner() {
    try {
        console.log('🔄 Connexion à MongoDB...');
        await mongoose.connect('mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db');
        console.log('✅ Connecté à MongoDB');
        
        // Chercher le partenaire ENT-752810
        const partner = await Partner.findOne({ partnerId: 'ENT-752810' });
        
        if (partner) {
            console.log('🎯 Partenaire ENT-752810 trouvé:');
            console.log('ID:', partner.partnerId);
            console.log('Nom:', partner.fullName);
            console.log('Email:', partner.email);
            console.log('Type:', partner.type);
            console.log('Actif:', partner.isActive);
            console.log('Créé le:', partner.createdAt);
        } else {
            console.log('❌ Partenaire ENT-752810 NON TROUVÉ');
            
            // Lister tous les partenaires de type entreprise
            const allEntreprises = await Partner.find({ type: 'entreprise' });
            console.log(`📋 Partenaires entreprise existants: ${allEntreprises.length}`);
            
            if (allEntreprises.length > 0) {
                console.log('\n📝 Liste des entreprises:');
                allEntreprises.forEach((p, index) => {
                    console.log(`${index + 1}. ID: ${p.partnerId} | Nom: ${p.fullName} | Actif: ${p.isActive}`);
                });
            }
            
            // Créer le partenaire ENT-752810
            console.log('\n🔧 Création du partenaire ENT-752810...');
            const newPartner = new Partner({
                partnerId: 'ENT-752810',
                fullName: 'Entreprise Test MATC',
                email: 'test@entreprise-matc.com',
                type: 'entreprise',
                isActive: true
            });
            
            await newPartner.save();
            console.log('✅ Partenaire ENT-752810 créé avec succès!');
        }
        
        // Test de login
        console.log('\n🔐 Test de login pour ENT-752810...');
        const loginPartner = await Partner.findOne({ 
            partnerId: 'ENT-752810', 
            isActive: true 
        });
        
        if (loginPartner) {
            console.log('✅ Login test réussi - Partenaire actif trouvé');
        } else {
            console.log('❌ Login test échoué - Partenaire non trouvé ou inactif');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Déconnecté de MongoDB');
    }
}

checkPartner();
