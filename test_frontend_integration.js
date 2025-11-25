// Test frontend API integration without starting the dev server
import { apiService } from './src/services/api.js';
import { transformToApiInputs, transformFromApiResult } from './src/utils/apiTransform.js';

// Mock frontend inputs (similar to what the form would generate)
const mockFrontendInputs = {
  employmentType: 'employee',
  grossSalary: 15000,
  pensionBase: undefined,
  jobs: [],
  selfEmployedIncome: undefined,
  isResident: true,
  gender: 'male',
  dateOfBirth: new Date('1993-01-01'),
  maritalStatus: 'married',
  numberOfChildren: 2,
  childrenAges: [5, 8],
  hasArmyService: false,
  armyServiceMonths: 0,
  armyDischargeDate: null,
  isNewImmigrant: false,
  immigrationDate: null,
  hasDisability: false,
  hasDisabilityExemption: false,
  locality: 'none',
  voluntaryPension: 6,
  hasSecondJob: false,
  secondJobIncome: 0,
  hasTeumMas: false,
  educationLevel: 'none'
};

async function testFrontendIntegration() {
  console.log('🧪 Testing Frontend Integration...\n');

  try {
    // Test 1: Transform frontend data to API format
    console.log('1. Testing data transformation...');
    const apiInputs = transformToApiInputs(mockFrontendInputs);
    console.log('✅ Frontend → API transformation successful');
    console.log('   Employment Type:', apiInputs.employment_type);
    console.log('   Gross Salary:', apiInputs.gross_salary);
    console.log('   Children:', apiInputs.children);
    console.log('   Spouse:', apiInputs.spouse);

    // Test 2: Make API call
    console.log('\n2. Testing API call...');
    const apiResult = await apiService.calculateSalary(apiInputs);
    console.log('✅ API call successful');
    console.log('   API Response Keys:', Object.keys(apiResult));

    // Test 3: Transform API result to frontend format
    console.log('\n3. Testing result transformation...');
    const frontendResult = transformFromApiResult(apiResult);
    console.log('✅ API → Frontend transformation successful');
    console.log('   Frontend Result Keys:', Object.keys(frontendResult));

    // Test 4: Display final result
    console.log('\n4. Final calculation result:');
    console.log(`   Gross Salary: ₪${frontendResult.grossSalary.toLocaleString()}`);
    console.log(`   Net Salary: ₪${frontendResult.netSalary.toLocaleString()}`);
    console.log(`   Income Tax: ₪${frontendResult.incomeTax.toLocaleString()}`);
    console.log(`   Credit Points: ${frontendResult.creditPoints}`);
    console.log(`   Effective Tax Rate: ${frontendResult.effectiveTaxRate.toFixed(2)}%`);

    console.log('\n🎉 Frontend integration test completed successfully!');

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Note: This would need to be run in a Node.js environment with ES modules support
// or converted to CommonJS format. For now, it serves as documentation of the test process.

console.log('Frontend Integration Test Script');
console.log('This script demonstrates the data flow from frontend to backend.');
console.log('To run the actual test, start both backend and frontend servers.');
console.log('\nBackend: cd /home/njama/mastik_calc_backend && python start_server.py');
console.log('Frontend: cd /home/njama/mastik_calc && npm run dev');
console.log('Then open http://localhost:5173 in your browser.');
