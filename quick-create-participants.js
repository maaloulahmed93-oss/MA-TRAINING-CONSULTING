// Quick script to create participants via API
const participants = [
  {
    partnerId: 'PART-2024-001',
    fullName: 'Ahmed Ben Ali',
    firstName: 'Ahmed',
    lastName: 'Ben Ali',
    email: 'ahmed.benali.001@matc.com',
    phone: '+216 98 123 456',
    address: 'Tunis, Tunisie',
    status: 'active',
    totalProgress: 75
  },
  {
    partnerId: 'PART-2024-002',
    fullName: 'Fatima Zahra',
    firstName: 'Fatima',
    lastName: 'Zahra',
    email: 'fatima.zahra.002@matc.com',
    phone: '+216 97 654 321',
    address: 'Sfax, Tunisie',
    status: 'active',
    totalProgress: 90
  },
  {
    partnerId: 'PART-2024-003',
    fullName: 'Mohamed Slim',
    firstName: 'Mohamed',
    lastName: 'Slim',
    email: 'mohamed.slim.003@matc.com',
    phone: '+216 99 888 777',
    address: 'Sousse, Tunisie',
    status: 'active',
    totalProgress: 45
  }
];

async function createParticipants() {
  console.log('Creating participants...');
  
  for (const participant of participants) {
    try {
      const response = await fetch('http://localhost:3001/api/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(participant)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Created: ${result.data.partnerId} - ${result.data.fullName}`);
      } else {
        const error = await response.json();
        console.log(`❌ Error creating ${participant.partnerId}: ${error.message}`);
      }
    } catch (error) {
      console.log(`❌ Network error for ${participant.partnerId}: ${error.message}`);
    }
  }
  
  console.log('Done!');
}

createParticipants();
