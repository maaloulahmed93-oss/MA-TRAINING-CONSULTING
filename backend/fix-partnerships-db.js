import mongoose from 'mongoose';
import Partnership from './models/Partnership.js';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db?retryWrites=true&w=majority&appName=matc';

async function fixPartnershipsDB() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Remove all partnerships to fix duplicate key issues
    console.log('🗑️ Clearing all partnerships...');
    const deleteResult = await Partnership.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} partnerships`);

    // Step 2: Create fresh partnerships with proper data
    console.log('🆕 Creating fresh partnerships...');
    
    const defaultPartnerships = [
      {
        partnershipId: 'PART-FORMATEUR-FIXED',
        type: 'formateur',
        title: 'Formateur',
        subtitle: 'Rejoignez notre équipe de formateurs experts',
        intro: 'Rejoignez notre équipe de formateurs experts et partagez vos connaissances avec nos apprenants.',
        icon: '📘',
        color: 'blue',
        gradient: 'from-blue-500 to-blue-600',
        details: [
          'Encadrer des sessions en présentiel et à distance',
          'Concevoir des supports pédagogiques de qualité',
          'Évaluer et suivre la progression des apprenants'
        ],
        requirements: [
          'Minimum 3 ans d\'expérience dans votre domaine',
          'Diplôme ou certifications reconnues',
          'Excellentes compétences pédagogiques',
          'Disponibilité flexible pour les formations',
          'Maîtrise des outils numériques'
        ],
        contactEmail: 'ahmedmaalou78l@gmail.com',
        ctaLabel: 'Accéder à l\'Espace Formateur',
        isActive: true
      },
      {
        partnershipId: 'PART-FREELANCE-FIXED',
        type: 'freelance',
        title: 'Freelance',
        subtitle: 'Collaborez avec nous en tant que freelance',
        intro: 'Collaborez avec nous en tant que freelance pour des missions ponctuelles ou récurrentes.',
        icon: '💻',
        color: 'green',
        gradient: 'from-green-500 to-green-600',
        details: [
          'Missions adaptées à votre expertise',
          'Collaboration flexible et agile',
          'Facturation simple et transparente'
        ],
        requirements: [
          'Portfolio démontrant vos compétences',
          'Expérience en freelancing ou projets indépendants',
          'Capacité à respecter les délais',
          'Communication professionnelle',
          'Spécialisation dans un domaine technique'
        ],
        contactEmail: 'ahmedmaalou78l@gmail.com',
        ctaLabel: 'Accéder à l\'Espace Freelancer',
        isActive: true
      },
      {
        partnershipId: 'PART-COMMERCIAL-FIXED',
        type: 'commercial',
        title: 'Commercial / Affilié',
        subtitle: 'Devenez notre partenaire commercial',
        intro: 'Devenez notre partenaire commercial et bénéficiez de commissions attractives sur les ventes.',
        icon: '📈',
        color: 'orange',
        gradient: 'from-orange-500 to-orange-600',
        details: [
          'Programme de commissions motivant',
          'Outils marketing fournis',
          'Suivi et reporting dédiés'
        ],
        requirements: [
          'Expérience en vente ou marketing',
          'Réseau professionnel développé',
          'Compétences en négociation',
          'Motivation et esprit entrepreneurial',
          'Connaissance du secteur de la formation'
        ],
        contactEmail: 'ahmedmaalou78l@gmail.com',
        ctaLabel: 'Accéder à l\'Espace Commercial',
        isActive: true
      },
      {
        partnershipId: 'PART-ENTREPRISE-FIXED',
        type: 'entreprise',
        title: 'Entreprise / École',
        subtitle: 'Établissez un partenariat institutionnel',
        intro: 'Établissez un partenariat institutionnel pour des formations sur mesure et des collaborations durables.',
        icon: '🏢',
        color: 'purple',
        gradient: 'from-purple-500 to-purple-600',
        details: [
          'Programmes adaptés aux objectifs',
          'Accompagnement et suivi personnalisés',
          'Modalités intra/inter-entreprise'
        ],
        requirements: [
          'Entreprise ou institution éducative établie',
          'Besoin récurrent en formation',
          'Capacité de collaboration à long terme',
          'Budget dédié à la formation',
          'Engagement dans le développement des compétences'
        ],
        contactEmail: 'ahmedmaalou78l@gmail.com',
        ctaLabel: 'Accéder à l\'Espace Partenariat',
        isActive: true
      }
    ];

    // Insert partnerships one by one
    for (const partnershipData of defaultPartnerships) {
      try {
        const partnership = new Partnership(partnershipData);
        await partnership.save();
        console.log(`✅ Created ${partnershipData.type}: ${partnershipData.requirements.length} requirements`);
      } catch (error) {
        console.error(`❌ Error creating ${partnershipData.type}:`, error.message);
      }
    }

    // Step 3: Verify the results
    console.log('🔍 Verifying results...');
    const allPartnerships = await Partnership.find({});
    console.log(`📊 Total partnerships: ${allPartnerships.length}`);
    
    allPartnerships.forEach(p => {
      console.log(`  - ${p.type}: ${p.requirements?.length || 0} requirements, partnershipId: ${p.partnershipId}`);
    });

    console.log('🎉 Database fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the fix
fixPartnershipsDB();
