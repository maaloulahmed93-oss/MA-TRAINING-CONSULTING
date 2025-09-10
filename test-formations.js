// Script de test pour vérifier les formations co-animées
// À exécuter dans la console du navigateur

console.log('=== Test des Formations Co-animées ===');

// Simuler l'import du service (dans un environnement de navigateur)
// Vous pouvez copier-coller ce code dans la console du navigateur

// Test 1: Vérifier si les données sont dans localStorage
const stored = localStorage.getItem('formationsCoAnimees');
if (stored) {
  console.log('✅ Données trouvées dans localStorage');
  const formations = JSON.parse(stored);
  console.log('📊 Nombre de formations:', formations.length);
  formations.forEach((formation, index) => {
    console.log(`${index + 1}. ${formation.title}`);
    console.log(`   - Date: ${formation.date}`);
    console.log(`   - Formateurs: ${formation.trainers.join(', ')}`);
    console.log(`   - Participants: ${formation.participants.length}`);
    console.log(`   - Ressources: ${formation.resources.length}`);
    console.log(`   - Feedbacks: ${formation.feedbacks.length}`);
    console.log(`   - Certificat: ${formation.certificateAvailable ? 'Oui' : 'Non'}`);
    console.log('');
  });
} else {
  console.log('❌ Aucune donnée trouvée dans localStorage');
  console.log('💡 Naviguez vers /partenaire/formations-co-animees pour initialiser les données');
}

// Test 2: Vérifier les routes
console.log('🔗 Routes à tester:');
console.log('1. /espace-partenariat (page principale)');
console.log('2. /partenaire/formations-co-animees (liste des formations)');
console.log('3. Cliquer sur une formation pour voir les détails');

// Test 3: Données mock attendues
console.log('📋 Données mock attendues:');
console.log('- Formation Agile & Scrum (avec participants et ressources)');
console.log('- Formation UX Design (vide, pour tester les cas sans données)');

console.log('=== Fin du test ===');
