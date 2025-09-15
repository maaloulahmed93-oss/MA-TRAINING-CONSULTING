// Simple Node.js script to create a test program
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

const testProgram = {
    title: "Test Program - Web Development",
    description: "A test program for web development using React and Node.js",
    category: "Technologies",
    level: "Débutant", 
    price: 299,
    duration: "4 weeks",
    maxParticipants: 20,
    sessionsPerYear: 4,
    modules: [
        { title: "HTML & CSS Basics" },
        { title: "JavaScript Fundamentals" }
    ],
    sessions: [
        { title: "Session 1", date: "2024-02-15" },
        { title: "Session 2", date: "2024-02-22" }
    ],
    isActive: true
};

async function createTestProgram() {
    try {
        console.log('🚀 Creating test program...');
        
        const response = await fetch(`${API_BASE}/programs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testProgram)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Program created successfully!');
            console.log('🆔 Program ID:', data.data._id);
            console.log('📚 Title:', data.data.title);
            
            // Now check programs
            console.log('\n🔍 Checking programs...');
            const getResponse = await fetch(`${API_BASE}/programs`);
            const getdata = await getResponse.json();
            console.log('📊 Programs count:', getdata.count);
            
        } else {
            console.log('❌ Failed to create program');
            console.log('Response:', data);
        }
        
    } catch (error) {
        console.log('💥 Error:', error.message);
    }
}

createTestProgram();
