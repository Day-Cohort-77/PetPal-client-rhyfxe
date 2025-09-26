// Test medication API
console.log('🧪 Testing medication API for pet ID 1...\n');

async function testMedicationAPI() {
  try {
    console.log('1. Testing pet medications API...');
    const response = await fetch('http://localhost:5001/medications/pet/1', {
      method: 'GET',
      credentials: 'include',
    });

    console.log('   Status:', response.status);
    console.log('   Headers:', [...response.headers.entries()]);
    
    if (response.status === 200) {
      const medications = await response.json();
      console.log('   ✅ Medications Success!');
      console.log('   Number of medications:', medications.length);
      
      if (medications.length > 0) {
        console.log('   First medication sample:');
        console.log('   -', medications[0]);
      } else {
        console.log('   📝 No medications found for this pet');
      }
    } else {
      console.log('   ❌ API call failed');
      const errorText = await response.text();
      console.log('   Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMedicationAPI();