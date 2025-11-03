// Comprehensive test script for all API integrations
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3002';

async function apiFetch(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return null;
  }
}

async function testAllAPIs() {
  console.log('🔍 TESTING ALL API INTEGRATIONS\n' + '='.repeat(50));
  
  // Test 1: Package Categories
  console.log('\n1️⃣ Testing Package Categories API:');
  const categories = await apiFetch('/packages/categories');
  console.log(`✅ Found ${categories?.length || 0} package categories:`);
  console.log(categories);
  
  // Test 2: Package Destinations
  console.log('\n2️⃣ Testing Package Destinations API:');
  const packageDestinations = await apiFetch('/packages/destinations');
  console.log(`✅ Found ${packageDestinations?.length || 0} package destinations:`);
  console.log(packageDestinations);
  
  // Test 3: Destination Countries
  console.log('\n3️⃣ Testing Destination Countries API:');
  const countries = await apiFetch('/destinations/countries');
  console.log(`✅ Found ${countries?.length || 0} destination countries`);
  console.log('Sample countries:', countries?.slice(0, 5));
  
  // Test 4: Multi City Destinations
  console.log('\n4️⃣ Testing Multi City Destinations API:');
  const multiCityDestinations = await apiFetch('/packages/multi-city');
  console.log(`✅ Found ${multiCityDestinations?.length || 0} multi-city destinations:`);
  console.log(multiCityDestinations);
  
  // Test 5: Packages with filters
  console.log('\n5️⃣ Testing Packages API with filters:');
  // Test with category filter
  const adventurePackages = await apiFetch('/packages?category=Adventure');
  console.log(`✅ Found ${adventurePackages?.length || 0} Adventure packages`);
  
  // Test with destination filter
  const japanPackages = await apiFetch('/packages?destination=Japan');
  console.log(`✅ Found ${japanPackages?.length || 0} Japan packages`);
  
  return {
    categories,
    packageDestinations,
    countries,
    multiCityDestinations,
    adventurePackages,
    japanPackages
  };
}

testAllAPIs().then((results) => {
  console.log('\n' + '='.repeat(50));
  console.log('📊 API INTEGRATION TEST SUMMARY:');
  
  const allSuccessful = 
    results.categories?.length > 0 &&
    results.packageDestinations?.length > 0 &&
    results.countries?.length > 0 &&
    results.multiCityDestinations?.length > 0;
  
  if (allSuccessful) {
    console.log('✅ SUCCESS: All API integrations are working correctly!');
  } else {
    console.log('⚠️ WARNING: Some API integrations may not be working correctly.');
    
    if (!results.categories?.length) console.log('❌ Package Categories API failed');
    if (!results.packageDestinations?.length) console.log('❌ Package Destinations API failed');
    if (!results.countries?.length) console.log('❌ Destination Countries API failed');
    if (!results.multiCityDestinations?.length) console.log('❌ Multi City Destinations API failed');
  }
});
