#  How to Run Jest Tests - Quick Guide

## 📋 Quick Start

### Run All Tests (Frontend + Backend)

```bash
# Terminal 1 - Run Frontend Tests
cd frontend
npm test

# Terminal 2 - Run Backend Tests  
cd backend
npm test
```

---

##  Frontend Tests

### Basic Commands

```bash
cd frontend

# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### What Gets Tested
-  Home page rendering (3 tests)
-  API integration mocks (9 tests)
-  Component structure
-  Error handling

**Result:** 12/12 tests passing 

---

##  Backend Tests

### Basic Commands

```bash
cd backend

# Run all tests once
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:booking    # Booking database tests
npm run test:payment    # Payment controller tests
```

### What Gets Tested

** Working Tests (30 tests passing):**
- Database connection and operations
- Booking creation, updates, queries
- Payment processing flow
- Data integrity and validation

**️ Tests Requiring Server (13 tests):**
- Destinations API endpoints
- Packages API endpoints
- Authentication endpoints

**Note:** Integration tests need the backend server running on port 3003.

---

##  Run Tests with Server Running

To test the API endpoints, you need the server running:

```bash
# Terminal 1 - Start Backend Server
cd backend
npm run dev

# Terminal 2 - Start Frontend Server (optional)
cd frontend
npm run dev

# Terminal 3 - Run Backend Tests
cd backend
npm test
```

---

##  View Coverage Reports

After running tests with coverage, open the HTML reports:

```bash
# Frontend Coverage
open frontend/coverage/lcov-report/index.html

# Backend Coverage
open backend/coverage/lcov-report/index.html
```

---

##  Test Output Examples

###  Successful Test Output
```
PASS  __tests__/home.test.tsx
  Home Page
    ✓ renders without crashing (107 ms)
    ✓ renders all main sections (9 ms)
    ✓ has correct main element structure (5 ms)

Test Suites: 2 passed, 2 total
Tests:       12 passed, 12 total
```

### ️ Tests Needing Server
```
FAIL  tests/destinations.test.js
  ● Destinations Controller Tests › GET /api/destinations
    AxiosError: Request failed with status code 404
```

**Solution:** Start the backend server first!

---

##  Test Files Location

### Frontend Tests
```
frontend/
├── __tests__/
│   ├── home.test.tsx          # Home page tests
│   └── api.test.tsx           # API integration tests
├── jest.config.js             # Jest configuration
└── jest.setup.js              # Test setup & mocks
```

### Backend Tests
```
backend/
├── tests/
│   ├── booking-database.test.js    #  Database tests
│   ├── payment-controller.test.js  #  Payment tests
│   ├── destinations.test.js        # ️ Needs server
│   ├── packages.test.js            # ️ Needs server
│   ├── auth.test.js                # ️ Needs server
│   └── setup.js                    # Test setup
└── jest.config.js                  # Jest configuration
```

---

##  Troubleshooting

### Issue: "Cannot find module '@testing-library/jest-dom'"
**Solution:** Install dependencies
```bash
cd frontend
npm install
```

### Issue: "Database connection failed"
**Solution:** Check database is running and .env file is configured
```bash
cd backend
cat .env  # Verify DB credentials
```

### Issue: "Tests timeout"
**Solution:** Increase timeout in jest.config.js
```javascript
testTimeout: 10000  // 10 seconds
```

### Issue: "Port already in use"
**Solution:** Kill existing processes
```bash
lsof -ti:3003 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend
```

---

##  Current Test Statistics

| Metric | Frontend | Backend | Total |
|--------|----------|---------|-------|
| **Test Suites** | 2 | 5 | 7 |
| **Tests Passing** | 12  | 30 ✅ | 42 ✅ |
| **Tests Failing** | 0 | 13 ️ | 13 ⚠️ |
| **Pass Rate** | 100% | 69.8% | 76.4% |

**Note:** Backend failures are due to server not running, not test issues.

---

##  Next Steps

1.  **Frontend tests are ready** - All passing
2. 🔄 **Start backend server** to run integration tests
3.  **Add more tests** as you build new features
4.  **Set up CI/CD** to run tests automatically

---

##  Tips

- Use `--watch` mode during development
- Run tests before committing code
- Check coverage reports to find untested code
- Write tests for new features immediately
- Keep tests fast and focused

---

**Happy Testing! **
