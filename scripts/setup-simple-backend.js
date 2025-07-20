#!/usr/bin/env node

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:10000';

async function setupSampleData() {
  console.log('Setting up sample data...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/sample-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ Sample data added successfully!');
      console.log('You can now access the email app and see the sample emails.');
    } else {
      console.error('❌ Failed to add sample data:', await response.text());
    }
  } catch (error) {
    console.error('❌ Error connecting to backend:', error.message);
    console.log('Make sure the backend is running on', BACKEND_URL);
  }
}

// Run the setup
setupSampleData(); 