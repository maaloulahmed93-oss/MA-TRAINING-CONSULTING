// Script de test pour vérifier le fonctionnement du catalogue unifié
// À exécuter dans la console du navigateur sur la page E-Training

console.log('🎯 Test du Catalogue Unifié - E-Training Page');

// Test 1: Vérifier que le bouton existe
const button = document.querySelector('button[class*="cta-button"]');
if (button && button.textContent.includes('🎯 Trouvez votre parcours idéal')) {
  console.log('✅ Bouton "Trouvez votre parcours idéal" trouvé');
} else {
  console.log('❌ Bouton non trouvé');
}

// Test 2: Vérifier que les sections ont les bons IDs
const programsSection = document.getElementById('programs-section');
const packsSection = document.getElementById('packs-section');

console.log('✅ Section programmes:', programsSection ? 'Trouvée' : '❌ Non trouvée');
console.log('✅ Section packs:', packsSection ? 'Trouvée' : '❌ Non trouvée');

// Test 3: Vérifier les data-attributes des programmes
const programCards = document.querySelectorAll('[data-program-id]');
console.log(`✅ Cartes programmes avec data-program-id: ${programCards.length}`);

// Test 4: Vérifier les data-attributes des packs
const packCards = document.querySelectorAll('[data-pack-id]');
console.log(`✅ Cartes packs avec data-pack-id: ${packCards.length}`);

// Test 5: Simuler le clic sur le bouton
if (button) {
  console.log('🔄 Simulation du clic sur le bouton...');
  button.click();
  
  // Vérifier que le modal s'ouvre
  setTimeout(() => {
    const modal = document.querySelector('[class*="fixed inset-0"]');
    if (modal) {
      console.log('✅ Modal ouvert avec succès');
      
      // Compter les éléments dans le catalogue
      const catalogItems = modal.querySelectorAll('[class*="cursor-pointer"]');
      console.log(`✅ Éléments dans le catalogue: ${catalogItems.length}`);
      
      // Fermer le modal
      const closeButton = modal.querySelector('button');
      if (closeButton) {
        closeButton.click();
        console.log('✅ Modal fermé');
      }
    } else {
      console.log('❌ Modal non trouvé');
    }
  }, 500);
}

console.log('🎯 Test terminé - Vérifiez les résultats ci-dessus');
