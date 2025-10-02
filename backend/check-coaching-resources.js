import mongoose from 'mongoose';
import Partner from './models/Partner.js';
import ParticipantResource from './models/ParticipantResource.js';

const MONGODB_URI = 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db';

async function checkCoachingResources() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const participantId = 'PART-550776';
    console.log(`\n🔍 Vérification des ressources pour ${participantId}...`);

    // 1. Vérifier que le participant existe
    const participant = await Partner.findOne({ partnerId: participantId, type: 'participant' });
    if (!participant) {
      console.log('❌ Participant non trouvé');
      return;
    }
    console.log(`✅ Participant trouvé: ${participant.fullName}`);

    // 2. Vérifier les ressources dans ParticipantResource collection
    const resources = await ParticipantResource.find({ participantId: participantId });
    console.log(`\n📚 Ressources dans ParticipantResource collection: ${resources.length}`);
    
    if (resources.length > 0) {
      console.log('📋 Détails des ressources:');
      resources.forEach((resource, index) => {
        console.log(`  ${index + 1}. ${resource.title}`);
        console.log(`     - Type: ${resource.type}`);
        console.log(`     - Catégorie: ${resource.category}`);
        console.log(`     - URL: ${resource.url || 'N/A'}`);
        console.log(`     - Active: ${resource.isActive}`);
        console.log('');
      });
    } else {
      console.log('⚠️ Aucune ressource trouvée dans ParticipantResource collection');
    }

    // 3. Créer des ressources de test si aucune n'existe
    if (resources.length === 0) {
      console.log('\n🔄 Création de ressources de test...');
      
      const sampleResources = [
        {
          participantId: participantId,
          title: 'Guide Entretien d\'Embauche',
          description: 'Préparer et réussir ses entretiens techniques',
          type: 'Guide',
          category: 'Carrière',
          url: 'https://example.com/guide-entretien',
          thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
          isActive: true
        },
        {
          participantId: participantId,
          title: 'CV Template Développeur',
          description: 'Modèle de CV moderne pour développeurs',
          type: 'CV Template',
          category: 'Templates',
          url: 'https://example.com/cv-template',
          thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=200&fit=crop',
          downloadUrl: 'https://example.com/cv-template-download',
          isActive: true
        },
        {
          participantId: participantId,
          title: 'Communication Efficace',
          description: 'Améliorer ses compétences de communication',
          type: 'Vidéo Soft Skills',
          category: 'Soft Skills',
          duration: '45 min',
          url: 'https://example.com/communication-video',
          thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop',
          isActive: true
        },
        {
          participantId: participantId,
          title: 'Lettre de Motivation Tech',
          description: 'Exemple de lettre pour postes techniques',
          type: 'Lettre de motivation',
          category: 'Templates',
          url: 'https://example.com/lettre-motivation',
          thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&h=200&fit=crop',
          downloadUrl: 'https://example.com/lettre-motivation-download',
          isActive: true
        }
      ];

      for (const resourceData of sampleResources) {
        const resource = new ParticipantResource(resourceData);
        await resource.save();
        console.log(`✅ Ressource créée: ${resource.title}`);
      }

      console.log(`\n🎉 ${sampleResources.length} ressources créées avec succès!`);
    }

    // 4. Test final - vérifier via l'API route
    console.log('\n🔍 Test de l\'endpoint API...');
    const allResources = await ParticipantResource.find({ participantId: participantId });
    console.log(`📊 Total ressources après création: ${allResources.length}`);

    // Simuler la transformation comme dans l'API
    const transformedResources = allResources.map(resource => {
      return {
        id: resource._id.toString(),
        title: resource.title,
        description: resource.description,
        type: resource.type,
        category: resource.category,
        thumbnail: resource.thumbnail,
        downloadUrl: resource.downloadUrl,
        duration: resource.duration,
        assignedDate: resource.assignedDate,
        isCompleted: resource.isCompleted,
        dataLinks: resource.url ? [{
          id: `link-${Date.now()}`,
          title: 'Lien principal',
          url: resource.url,
          type: 'external'
        }] : []
      };
    });

    console.log('\n📋 Ressources transformées (comme dans l\'API):');
    transformedResources.forEach((resource, index) => {
      console.log(`  ${index + 1}. ${resource.title} (${resource.category})`);
      console.log(`     - Type: ${resource.type}`);
      console.log(`     - DataLinks: ${resource.dataLinks.length}`);
    });

    console.log('\n✅ Diagnostic terminé!');
    console.log('\n🔗 Instructions:');
    console.log('1. Ouvrez test-coaching-resources.html pour des tests détaillés');
    console.log('2. Allez sur http://localhost:5173/espace-participant');
    console.log('3. Connectez-vous avec PART-550776 / gharbi@gmail.com');
    console.log('4. Naviguez vers "Coaching & Orientation"');
    console.log('5. Vérifiez que les ressources apparaissent');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

checkCoachingResources();
