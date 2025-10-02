// Script pour tester le nouveau partenaire créé
const API_URL = 'http://localhost:3001/api/partners';

async function testNewPartner() {
    try {
        console.log('🔍 Récupération de tous les partenaires...');
        
        // Lister tous les partenaires
        const response = await fetch(API_URL);
        const result = await response.json();
        
        if (response.ok && result.data.length > 0) {
            console.log(`✅ ${result.count} partenaires trouvés:`);
            
            // Trouver le dernier partenaire entreprise créé
            const entreprises = result.data.filter(p => p.type === 'entreprise');
            
            if (entreprises.length > 0) {
                const lastEntreprise = entreprises[entreprises.length - 1];
                console.log('\n🏢 Dernier partenaire entreprise:');
                console.log('ID:', lastEntreprise.partnerId);
                console.log('Nom:', lastEntreprise.fullName);
                console.log('Email:', lastEntreprise.email);
                console.log('Type:', lastEntreprise.type);
                console.log('Actif:', lastEntreprise.isActive);
                
                // Test de login avec ce partenaire
                console.log('\n🔐 Test de login avec', lastEntreprise.partnerId);
                
                const loginResponse = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ partnerId: lastEntreprise.partnerId })
                });
                
                const loginResult = await loginResponse.json();
                
                if (loginResponse.ok) {
                    console.log('✅ Login réussi!');
                    console.log('Message:', loginResult.message);
                    console.log('\n🎯 UTILISEZ CET ID POUR VOUS CONNECTER:');
                    console.log('👉', lastEntreprise.partnerId);
                } else {
                    console.log('❌ Login échoué:', loginResult.message);
                }
            } else {
                console.log('❌ Aucune entreprise trouvée');
            }
        } else {
            console.log('❌ Erreur lors de la récupération:', result.message);
        }
        
    } catch (error) {
        console.log('❌ Erreur:', error.message);
    }
}

testNewPartner();
