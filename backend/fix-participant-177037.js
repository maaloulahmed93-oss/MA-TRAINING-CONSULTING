import mongoose from 'mongoose';
import Partner from './models/Partner.js';

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matc-training';

async function fixParticipant177037() {
    try {
        console.log('🔄 Connexion à MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connecté à MongoDB');

        const participantId = 'PART-177037';
        
        console.log(`\n🔍 Recherche du participant ${participantId}...`);
        
        // Chercher le participant
        let participant = await Partner.findOne({ partnerId: participantId });
        
        if (participant) {
            console.log('✅ Participant trouvé dans la base de données');
            console.log('📊 Données actuelles:');
            console.log(`   - Partner ID: ${participant.partnerId}`);
            console.log(`   - Nom: ${participant.fullName}`);
            console.log(`   - Email: ${participant.email}`);
            console.log(`   - Type: ${participant.type}`);
            console.log(`   - Actif: ${participant.isActive}`);
            console.log(`   - Description: ${participant.description}`);
            
            // Vérifier et corriger les problèmes
            let needsUpdate = false;
            const updates = {};
            
            if (participant.type !== 'participant') {
                console.log(`⚠️  Correction du type: "${participant.type}" → "participant"`);
                updates.type = 'participant';
                needsUpdate = true;
            }
            
            if (!participant.isActive) {
                console.log(`⚠️  Activation du participant: false → true`);
                updates.isActive = true;
                needsUpdate = true;
            }
            
            if (!participant.fullName || participant.fullName.trim() === '') {
                console.log(`⚠️  Ajout du nom: "${participant.fullName}" → "Ahmed"`);
                updates.fullName = 'Ahmed';
                needsUpdate = true;
            }
            
            if (!participant.email || participant.email.trim() === '') {
                console.log(`⚠️  Ajout de l'email: "${participant.email}" → "aj@hotmail.com"`);
                updates.email = 'aj@hotmail.com';
                needsUpdate = true;
            }
            
            // Vérifier/corriger la description
            let description = {};
            try {
                description = JSON.parse(participant.description || '{}');
            } catch (e) {
                console.log('⚠️  Description JSON invalide, création d\'une nouvelle');
                description = {};
                needsUpdate = true;
            }
            
            if (!description.firstName) {
                description.firstName = 'Ahmed';
                needsUpdate = true;
            }
            if (!description.status) {
                description.status = 'active';
                needsUpdate = true;
            }
            if (!description.enrollmentDate) {
                description.enrollmentDate = new Date().toISOString();
                needsUpdate = true;
            }
            if (!description.lastActivity) {
                description.lastActivity = new Date().toISOString();
                needsUpdate = true;
            }
            if (description.totalProgress === undefined) {
                description.totalProgress = 0;
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                updates.description = JSON.stringify(description);
                updates.updatedAt = new Date();
                
                console.log('\n🔧 Application des corrections...');
                await Partner.updateOne({ partnerId: participantId }, updates);
                console.log('✅ Participant corrigé avec succès!');
            } else {
                console.log('✅ Aucune correction nécessaire');
            }
            
        } else {
            console.log('❌ Participant non trouvé, création d\'un nouveau...');
            
            // Créer un nouveau participant
            const newParticipant = new Partner({
                partnerId: participantId,
                fullName: 'Ahmed',
                email: 'aj@hotmail.com',
                phone: '+216 20 123 456',
                address: 'Tunis, Tunisie',
                type: 'participant',
                isActive: true,
                description: JSON.stringify({
                    firstName: 'Ahmed',
                    lastName: '',
                    avatar: '',
                    status: 'active',
                    notes: 'Participant créé automatiquement',
                    totalProgress: 0,
                    enrollmentDate: new Date().toISOString(),
                    lastActivity: new Date().toISOString()
                })
            });
            
            await newParticipant.save();
            console.log('✅ Nouveau participant créé avec succès!');
        }
        
        // Vérification finale
        console.log('\n🧪 Vérification finale...');
        const finalParticipant = await Partner.findOne({ 
            partnerId: participantId, 
            type: 'participant', 
            isActive: true 
        });
        
        if (finalParticipant) {
            console.log('🎉 SUCCÈS! Le participant est maintenant accessible via l\'API');
            console.log('📊 Données finales:');
            console.log(`   - Partner ID: ${finalParticipant.partnerId}`);
            console.log(`   - Nom: ${finalParticipant.fullName}`);
            console.log(`   - Email: ${finalParticipant.email}`);
            console.log(`   - Type: ${finalParticipant.type}`);
            console.log(`   - Actif: ${finalParticipant.isActive}`);
            
            const additionalData = JSON.parse(finalParticipant.description || '{}');
            console.log('   - Données additionnelles:');
            console.log(`     • Prénom: ${additionalData.firstName}`);
            console.log(`     • Statut: ${additionalData.status}`);
            console.log(`     • Progrès: ${additionalData.totalProgress}%`);
            console.log(`     • Inscription: ${additionalData.enrollmentDate}`);
        } else {
            console.log('❌ ÉCHEC! Le participant n\'est toujours pas accessible');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Déconnecté de MongoDB');
    }
}

// Exécuter le script
console.log('🔧 Script de réparation PART-177037');
console.log('=====================================');
fixParticipant177037();
