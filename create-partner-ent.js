// Script pour créer le partenaire ENT-752810 directement via API
const API_URL = 'http://localhost:3001/api/partners';

async function createPartner() {
    try {
        console.log('🔄 Création du partenaire ENT-752810...');
        
        const partnerData = {
            fullName: 'Entreprise Test MATC',
            email: 'test@entreprise-matc.com',
            type: 'entreprise'
        };
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(partnerData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Partenaire créé avec succès!');
            console.log('ID généré:', result.data.partnerId);
            console.log('Nom:', result.data.fullName);
            console.log('Email:', result.data.email);
            console.log('Type:', result.data.type);
            
            // Test de login immédiatement
            console.log('\n🔐 Test de login...');
            const loginResponse = await fetch('http://localhost:3001/api/partners/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ partnerId: result.data.partnerId })
            });
            
            const loginResult = await loginResponse.json();
            
            if (loginResponse.ok) {
                console.log('✅ Login test réussi!');
                console.log('Message:', loginResult.message);
            } else {
                console.log('❌ Login test échoué:', loginResult.message);
            }
            
        } else {
            console.log('❌ Erreur lors de la création:', result.message);
        }
        
    } catch (error) {
        console.log('❌ Erreur:', error.message);
    }
}

createPartner();
