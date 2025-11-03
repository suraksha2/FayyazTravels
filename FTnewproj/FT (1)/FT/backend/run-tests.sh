#!/bin/bash

# FT Travel Booking System - Test Execution Script
# This script runs all tests and generates comprehensive reports

echo "🚀 FT Travel Booking System - Comprehensive Test Suite"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Installing test dependencies...${NC}"
npm install

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed successfully${NC}"

# Set test environment
export NODE_ENV=test
export AIRWALLEX_ENV=demo

echo -e "${BLUE}🧪 Running individual test suites...${NC}"

# Run Airwallex Payment Integration Tests
echo -e "${YELLOW}🔄 Running Airwallex Payment Integration Tests...${NC}"
npm run test -- test/airwallex-payment.test.js
AIRWALLEX_EXIT_CODE=$?

# Run Booking System Tests
echo -e "${YELLOW}🔄 Running Booking System Tests...${NC}"
npm run test -- test/booking-system.test.js
BOOKING_EXIT_CODE=$?

# Run API Endpoints Tests
echo -e "${YELLOW}🔄 Running API Endpoints Tests...${NC}"
npm run test -- test/api-endpoints.test.js
API_EXIT_CODE=$?

# Run Database Integration Tests
echo -e "${YELLOW}🔄 Running Database Integration Tests...${NC}"
npm run test -- test/database-integration.test.js
DB_EXIT_CODE=$?

# Run Complete Integration Suite
echo -e "${YELLOW}🔄 Running Complete Integration Suite...${NC}"
npm run test -- test/integration-suite.test.js
INTEGRATION_EXIT_CODE=$?

# Generate comprehensive test report
echo -e "${BLUE}📊 Generating comprehensive test report...${NC}"
node generate-test-report.js
REPORT_EXIT_CODE=$?

# Calculate overall result
TOTAL_FAILURES=$((AIRWALLEX_EXIT_CODE + BOOKING_EXIT_CODE + API_EXIT_CODE + DB_EXIT_CODE + INTEGRATION_EXIT_CODE))

echo ""
echo "======================================================"
echo -e "${BLUE}📊 TEST EXECUTION SUMMARY${NC}"
echo "======================================================"

# Display individual test results
if [ $AIRWALLEX_EXIT_CODE -eq 0 ]; then
    echo -e "💳 Airwallex Payment Tests: ${GREEN}✅ PASSED${NC}"
else
    echo -e "💳 Airwallex Payment Tests: ${RED}❌ FAILED${NC}"
fi

if [ $BOOKING_EXIT_CODE -eq 0 ]; then
    echo -e "📋 Booking System Tests: ${GREEN}✅ PASSED${NC}"
else
    echo -e "📋 Booking System Tests: ${RED}❌ FAILED${NC}"
fi

if [ $API_EXIT_CODE -eq 0 ]; then
    echo -e "🌐 API Endpoints Tests: ${GREEN}✅ PASSED${NC}"
else
    echo -e "🌐 API Endpoints Tests: ${RED}❌ FAILED${NC}"
fi

if [ $DB_EXIT_CODE -eq 0 ]; then
    echo -e "🗄️ Database Integration Tests: ${GREEN}✅ PASSED${NC}"
else
    echo -e "🗄️ Database Integration Tests: ${RED}❌ FAILED${NC}"
fi

if [ $INTEGRATION_EXIT_CODE -eq 0 ]; then
    echo -e "🎯 Complete Integration Suite: ${GREEN}✅ PASSED${NC}"
else
    echo -e "🎯 Complete Integration Suite: ${RED}❌ FAILED${NC}"
fi

echo ""

# Display report generation result
if [ $REPORT_EXIT_CODE -eq 0 ]; then
    echo -e "📄 Test Reports Generated: ${GREEN}✅ SUCCESS${NC}"
    echo "   📊 test-report.html - Detailed HTML report"
    echo "   📋 test-report.json - JSON data for CI/CD"
    echo "   📝 test-report.md - Markdown summary"
else
    echo -e "📄 Test Reports: ${YELLOW}⚠️ PARTIAL${NC}"
fi

echo ""
echo "======================================================"

# Final result
if [ $TOTAL_FAILURES -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! SYSTEM IS PRODUCTION READY!${NC}"
    echo -e "${GREEN}✅ Airwallex Integration: FULLY TESTED${NC}"
    echo -e "${GREEN}✅ Booking System: FULLY TESTED${NC}"
    echo -e "${GREEN}✅ API Endpoints: FULLY TESTED${NC}"
    echo -e "${GREEN}✅ Database Integration: FULLY TESTED${NC}"
    echo -e "${GREEN}✅ End-to-End Integration: FULLY TESTED${NC}"
    echo ""
    echo -e "${BLUE}🚀 Ready for deployment to production!${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED ($TOTAL_FAILURES test suites)${NC}"
    echo -e "${YELLOW}⚠️ Please review failed tests before deployment${NC}"
    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo "1. Review failed test output above"
    echo "2. Fix any issues identified"
    echo "3. Re-run tests until all pass"
    echo "4. Deploy to staging for final verification"
    exit 1
fi
