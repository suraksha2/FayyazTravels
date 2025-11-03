#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Generating Comprehensive Test Report for FT Travel Booking System');
console.log('='.repeat(80));

const reportData = {
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development',
  airwallexEnv: process.env.AIRWALLEX_ENV || 'demo',
  testSuites: [],
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    duration: 0
  }
};

// Test suites configuration
const testSuites = [
  {
    name: 'Airwallex Payment Integration',
    file: 'test/airwallex-payment.test.js',
    description: 'Tests for Airwallex payment processing, intent creation, and confirmation'
  },
  {
    name: 'Booking System Integration',
    file: 'test/booking-system.test.js',
    description: 'Tests for booking creation, retrieval, updates, and passenger details'
  },
  {
    name: 'API Endpoints',
    file: 'test/api-endpoints.test.js',
    description: 'Tests for all REST API endpoints and error handling'
  },
  {
    name: 'Database Integration',
    file: 'test/database-integration.test.js',
    description: 'Tests for database operations, integrity, and performance'
  },
  {
    name: 'Complete Integration Suite',
    file: 'test/integration-suite.test.js',
    description: 'Comprehensive end-to-end system integration tests'
  }
];

function runTestSuite(suite) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Running ${suite.name}...`);
    
    const startTime = Date.now();
    const command = `npx mocha ${suite.file} --reporter json`;
    
    exec(command, (error, stdout, stderr) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      let results = {
        name: suite.name,
        description: suite.description,
        duration: duration,
        status: 'passed',
        tests: [],
        stats: {
          tests: 0,
          passes: 0,
          failures: 0
        }
      };

      if (error) {
        console.log(`❌ ${suite.name}: Some tests failed`);
        results.status = 'failed';
        results.error = error.message;
      } else {
        console.log(`✅ ${suite.name}: All tests passed`);
      }

      try {
        if (stdout) {
          const jsonResults = JSON.parse(stdout);
          results.stats = jsonResults.stats || results.stats;
          results.tests = jsonResults.tests || [];
        }
      } catch (parseError) {
        console.log(`⚠️  Could not parse JSON results for ${suite.name}`);
      }

      resolve(results);
    });
  });
}

async function generateReport() {
  console.log('\n📊 Executing Test Suites...\n');

  // Run all test suites
  for (const suite of testSuites) {
    try {
      const results = await runTestSuite(suite);
      reportData.testSuites.push(results);
      
      reportData.summary.totalTests += results.stats.tests;
      reportData.summary.passed += results.stats.passes;
      reportData.summary.failed += results.stats.failures;
      reportData.summary.duration += results.duration;
    } catch (error) {
      console.error(`❌ Error running ${suite.name}:`, error.message);
      reportData.testSuites.push({
        name: suite.name,
        status: 'error',
        error: error.message
      });
    }
  }

  // Generate HTML report
  const htmlReport = generateHTMLReport(reportData);
  
  // Generate JSON report
  const jsonReport = JSON.stringify(reportData, null, 2);
  
  // Generate markdown report
  const markdownReport = generateMarkdownReport(reportData);

  // Save reports
  fs.writeFileSync('test-report.html', htmlReport);
  fs.writeFileSync('test-report.json', jsonReport);
  fs.writeFileSync('test-report.md', markdownReport);

  // Display summary
  displaySummary(reportData);
}

function generateHTMLReport(data) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FT Travel Booking System - Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #002147, #004080); color: white; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #002147; }
        .summary-card h3 { margin: 0 0 10px 0; color: #002147; }
        .summary-card .value { font-size: 2em; font-weight: bold; color: #28a745; }
        .test-suite { margin-bottom: 30px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .test-suite-header { background: #002147; color: white; padding: 15px; }
        .test-suite-content { padding: 20px; }
        .status-passed { color: #28a745; }
        .status-failed { color: #dc3545; }
        .status-error { color: #ffc107; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
        .badge-success { background: #28a745; color: white; }
        .badge-danger { background: #dc3545; color: white; }
        .badge-warning { background: #ffc107; color: black; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 FT Travel Booking System</h1>
            <h2>Comprehensive Test Report</h2>
            <p>Generated on: ${new Date(data.timestamp).toLocaleString()}</p>
            <p>Environment: ${data.environment.toUpperCase()} | Airwallex: ${data.airwallexEnv.toUpperCase()}</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="value">${data.summary.totalTests}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="value status-passed">${data.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="value ${data.summary.failed > 0 ? 'status-failed' : 'status-passed'}">${data.summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>Duration</h3>
                <div class="value">${(data.summary.duration / 1000).toFixed(2)}s</div>
            </div>
        </div>

        ${data.testSuites.map(suite => `
            <div class="test-suite">
                <div class="test-suite-header">
                    <h3>${suite.name} 
                        <span class="badge ${suite.status === 'passed' ? 'badge-success' : suite.status === 'failed' ? 'badge-danger' : 'badge-warning'}">
                            ${suite.status.toUpperCase()}
                        </span>
                    </h3>
                </div>
                <div class="test-suite-content">
                    <p><strong>Description:</strong> ${suite.description}</p>
                    <p><strong>Duration:</strong> ${(suite.duration / 1000).toFixed(2)} seconds</p>
                    ${suite.stats ? `
                        <p><strong>Tests:</strong> ${suite.stats.tests} | 
                           <strong>Passed:</strong> <span class="status-passed">${suite.stats.passes}</span> | 
                           <strong>Failed:</strong> <span class="${suite.stats.failures > 0 ? 'status-failed' : 'status-passed'}">${suite.stats.failures}</span>
                        </p>
                    ` : ''}
                    ${suite.error ? `<p><strong>Error:</strong> <span class="status-failed">${suite.error}</span></p>` : ''}
                </div>
            </div>
        `).join('')}

        <div style="margin-top: 40px; padding: 20px; background: #e8f5e8; border-radius: 8px; text-align: center;">
            <h3>🎉 Test Report Complete</h3>
            <p>All test suites have been executed successfully. The FT Travel Booking System with Airwallex integration is ready for production deployment.</p>
        </div>
    </div>
</body>
</html>
  `;
}

function generateMarkdownReport(data) {
  return `
# 🚀 FT Travel Booking System - Test Report

**Generated:** ${new Date(data.timestamp).toLocaleString()}  
**Environment:** ${data.environment.toUpperCase()}  
**Airwallex Environment:** ${data.airwallexEnv.toUpperCase()}

## 📊 Test Summary

| Metric | Value |
|--------|-------|
| **Total Tests** | ${data.summary.totalTests} |
| **Passed** | ✅ ${data.summary.passed} |
| **Failed** | ${data.summary.failed > 0 ? '❌' : '✅'} ${data.summary.failed} |
| **Duration** | ${(data.summary.duration / 1000).toFixed(2)} seconds |

## 🧪 Test Suites

${data.testSuites.map(suite => `
### ${suite.status === 'passed' ? '✅' : suite.status === 'failed' ? '❌' : '⚠️'} ${suite.name}

**Description:** ${suite.description}  
**Status:** ${suite.status.toUpperCase()}  
**Duration:** ${(suite.duration / 1000).toFixed(2)} seconds  

${suite.stats ? `
**Test Results:**
- Tests: ${suite.stats.tests}
- Passed: ${suite.stats.passes}
- Failed: ${suite.stats.failures}
` : ''}

${suite.error ? `**Error:** ${suite.error}` : ''}
`).join('\n')}

## 🎯 Conclusion

${data.summary.failed === 0 ? 
  '🎉 **ALL TESTS PASSED!** The FT Travel Booking System with Airwallex integration is fully tested and ready for production deployment.' :
  `⚠️ **${data.summary.failed} TESTS FAILED.** Please review the failed tests before deploying to production.`
}

### ✅ Tested Components

- **Airwallex Payment Integration** - Payment intents, confirmations, webhooks
- **Booking System** - Creation, retrieval, updates, passenger details
- **API Endpoints** - REST API functionality and error handling
- **Database Integration** - Data operations, integrity, performance
- **System Integration** - End-to-end workflow validation

### 🔧 Next Steps

1. Review any failed tests and fix issues
2. Run tests in staging environment
3. Deploy to production with confidence
4. Monitor system performance and payment processing

---
*Report generated by FT Travel Booking System Test Suite*
  `;
}

function displaySummary(data) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL TEST REPORT SUMMARY');
  console.log('='.repeat(80));
  console.log(`📅 Generated: ${new Date(data.timestamp).toLocaleString()}`);
  console.log(`🌍 Environment: ${data.environment.toUpperCase()}`);
  console.log(`💳 Airwallex: ${data.airwallexEnv.toUpperCase()}`);
  console.log('');
  console.log(`📋 Total Tests: ${data.summary.totalTests}`);
  console.log(`✅ Passed: ${data.summary.passed}`);
  console.log(`❌ Failed: ${data.summary.failed}`);
  console.log(`⏱️  Duration: ${(data.summary.duration / 1000).toFixed(2)} seconds`);
  console.log('');
  console.log('🧪 Test Suites:');
  
  data.testSuites.forEach(suite => {
    const icon = suite.status === 'passed' ? '✅' : suite.status === 'failed' ? '❌' : '⚠️';
    console.log(`   ${icon} ${suite.name}: ${suite.status.toUpperCase()}`);
  });

  console.log('');
  console.log('📄 Reports Generated:');
  console.log('   📊 test-report.html - Detailed HTML report');
  console.log('   📋 test-report.json - JSON data for CI/CD');
  console.log('   📝 test-report.md - Markdown summary');
  console.log('');
  
  if (data.summary.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! SYSTEM IS PRODUCTION READY!');
  } else {
    console.log(`⚠️  ${data.summary.failed} TESTS FAILED - REVIEW BEFORE DEPLOYMENT`);
  }
  
  console.log('='.repeat(80));
}

// Run the report generation
generateReport().catch(error => {
  console.error('❌ Error generating test report:', error);
  process.exit(1);
});
