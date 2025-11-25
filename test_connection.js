// Test script to verify frontend-backend connection
const API_BASE_URL = 'http://localhost:8000';

async function testConnection() {
  console.log('🔍 Testing Frontend-Backend Connection...\n');

  // Test 1: Health Check
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }

  // Test 2: Calculate Endpoint
  try {
    console.log('\n2. Testing calculation endpoint...');
    const testData = {
      employment_type: "employee",
      gross_salary: 15000,
      age: 30,
      children: 2,
      spouse: true,
      spouse_income: 0,
      disabled: false,
      new_immigrant: false,
      student: false,
      reserve_duty: false,
      pension_rate: 6
    };

    const calcResponse = await fetch(`${API_BASE_URL}/api/v1/calculator/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (calcResponse.ok) {
      const calcResult = await calcResponse.json();
      console.log('✅ Calculation successful:');
      console.log(`   Gross: ₪${calcResult.gross_salary.toLocaleString()}`);
      console.log(`   Net: ₪${calcResult.net_salary.toLocaleString()}`);
      console.log(`   Tax Rate: ${calcResult.effective_tax_rate.toFixed(2)}%`);
    } else {
      console.log('❌ Calculation failed:', calcResponse.status, calcResponse.statusText);
    }
  } catch (error) {
    console.log('❌ Calculation test failed:', error.message);
  }

  // Test 3: Tax Constants
  try {
    console.log('\n3. Testing tax constants endpoint...');
    const constantsResponse = await fetch(`${API_BASE_URL}/api/v1/calculator/constants`);
    const constantsData = await constantsResponse.json();
    console.log('✅ Tax constants retrieved successfully');
    console.log('   National Insurance Rate:', constantsData.national_insurance.employee_rate);
  } catch (error) {
    console.log('❌ Tax constants test failed:', error.message);
  }

  console.log('\n🎉 Connection test completed!');
}

// Run the test
testConnection();
