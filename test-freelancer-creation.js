/**
 * Script de test pour la création de Freelancers
 * Teste le flux complet: Admin Panel → Backend → MongoDB
 */

const API_BASE = 'http://localhost:3001/api';

async function testFreelancerCreation() {
  console.log('🧪 TEST: Création de Freelancer');
  console.log('================================');

  try {
    // Test 1: Créer un nouveau freelancer
    console.log('\n1️⃣ Création d\'un nouveau freelancer...');
    
    const freelancerData = {
      fullName: 'Jean Dupont',
      email: `freelancer.test.${Date.now()}@example.com`,
      type: 'freelancer',
      phone: '+33123456789',
      description: 'Développeur React/Node.js expérimenté'
    };

    const createResponse = await fetch(`${API_BASE}/partners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(freelancerData)
    });

    const createResult = await createResponse.json();
    
    if (createResult.success) {
      console.log('✅ Freelancer créé avec succès!');
      console.log(`📋 ID généré: ${createResult.data.partnerId}`);
      console.log(`📧 Email: ${createResult.data.email}`);
      console.log(`🏷️ Type: ${createResult.data.type}`);
      
      // Test 2: Vérifier que l'ID suit le format FRE-XXXXXX
      const partnerId = createResult.data.partnerId;
      if (partnerId.startsWith('FRE-') && partnerId.length === 10) {
        console.log('✅ Format ID correct: FRE-XXXXXX');
      } else {
        console.log('❌ Format ID incorrect:', partnerId);
      }

      // Test 3: Tester la connexion avec l'ID généré
      console.log('\n2️⃣ Test de connexion avec l\'ID généré...');
      
      const loginResponse = await fetch(`${API_BASE}/partners/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          partnerId: partnerId,
          partnerType: 'freelancer'
        })
      });

      const loginResult = await loginResponse.json();
      
      if (loginResult.success) {
        console.log('✅ Connexion freelancer réussie!');
        console.log(`👤 Nom: ${loginResult.data.fullName}`);
        console.log(`📅 Dernière connexion: ${loginResult.data.lastLogin}`);
      } else {
        console.log('❌ Échec de connexion:', loginResult.message);
      }

      // Test 4: Tester avec un mauvais type
      console.log('\n3️⃣ Test avec mauvais type (doit échouer)...');
      
      const badTypeResponse = await fetch(`${API_BASE}/partners/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          partnerId: partnerId,
          partnerType: 'entreprise'
        })
      });

      const badTypeResult = await badTypeResponse.json();
      
      if (!badTypeResult.success && badTypeResult.message.includes('invalide')) {
        console.log('✅ Validation type correcte - accès refusé comme attendu');
        console.log(`📝 Message: ${badTypeResult.message}`);
      } else {
        console.log('❌ Validation type échouée');
      }

      // Test 5: Vérifier les statistiques
      console.log('\n4️⃣ Vérification des statistiques...');
      
      const statsResponse = await fetch(`${API_BASE}/partners/stats/overview`);
      const statsResult = await statsResponse.json();
      
      if (statsResult.success) {
        console.log('✅ Statistiques récupérées:');
        console.log(`👥 Total partenaires: ${statsResult.data.total}`);
        console.log(`💼 Freelancers: ${statsResult.data.freelancers}`);
        console.log(`🏢 Entreprises: ${statsResult.data.entreprises}`);
        console.log(`👨‍🏫 Formateurs: ${statsResult.data.formateurs}`);
      }

      return partnerId;

    } else {
      console.log('❌ Échec de création:', createResult.message);
      return null;
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    return null;
  }
}

// Test avec ID invalide
async function testInvalidFreelancerId() {
  console.log('\n🧪 TEST: ID Freelancer invalide');
  console.log('=================================');

  try {
    const invalidResponse = await fetch(`${API_BASE}/partners/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        partnerId: 'FRE-999999',
        partnerType: 'freelancer'
      })
    });

    const invalidResult = await invalidResponse.json();
    
    if (!invalidResult.success) {
      console.log('✅ ID invalide correctement rejeté');
      console.log(`📝 Message: ${invalidResult.message}`);
    } else {
      console.log('❌ ID invalide accepté (problème!)');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test ID invalide:', error.message);
  }
}

// Exécution des tests
async function runAllTests() {
  console.log('🚀 DÉBUT DES TESTS FREELANCER');
  console.log('==============================\n');

  const createdId = await testFreelancerCreation();
  await testInvalidFreelancerId();

  console.log('\n🏁 TESTS TERMINÉS');
  console.log('==================');
  
  if (createdId) {
    console.log(`✅ Freelancer de test créé: ${createdId}`);
    console.log('💡 Vous pouvez maintenant tester la connexion sur /espace-freelancer');
  }
}

// Lancer les tests si le script est exécuté directement
if (typeof window === 'undefined') {
  runAllTests().catch(console.error);
}

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testFreelancerCreation, testInvalidFreelancerId, runAllTests };
}
