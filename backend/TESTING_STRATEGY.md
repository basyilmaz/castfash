# 🧪 Backend Testing Strategy

## Test Pyramid

```
        /\
       /E2E\          <- 10% (Critical user flows)
      /------\
     /  INT   \       <- 30% (API endpoints, DB)
    /----------\
   /   UNIT     \     <- 60% (Services, utilities)
  /--------------\
```

## Phase 1: Unit Tests (Services)

### 1.1 Auth Service Tests ✅
- [x] signup() - success
- [x] signup() - duplicate email
- [x] login() - success
- [x] login() - invalid credentials
- [x] login() - user not found
- [x] refresh() - valid token
- [x] refresh() - invalid token

### 1.2 Generation Service Tests
- [ ] generate() - success
- [ ] generate() - insufficient credits
- [ ] generate() - invalid product
- [ ] generate() - invalid model profile
- [ ] generate() - invalid scene
- [ ] listGenerations() - with filters
- [ ] getGenerationDetail() - success
- [ ] runBatch() - success

### 1.3 Product Service Tests
- [ ] create() - success
- [ ] findAll() - with pagination
- [ ] findOne() - success
- [ ] update() - success
- [ ] delete() - success

## Phase 2: Integration Tests (E2E)

### 2.1 Auth Flow
- [ ] POST /auth/signup - success
- [ ] POST /auth/signup - validation errors
- [ ] POST /auth/login - success
- [ ] POST /auth/login - wrong password
- [ ] GET /me/organization - with auth

### 2.2 Product Flow
- [ ] POST /products - create product
- [ ] GET /products - list products
- [ ] GET /products/:id - get product
- [ ] PUT /products/:id - update product
- [ ] DELETE /products/:id - delete product

### 2.3 Generation Flow
- [ ] POST /products/:id/generate - generate images
- [ ] GET /generations - list generations
- [ ] GET /generations/:id - get generation detail

### 2.4 Health Checks
- [ ] GET /health - full health check
- [ ] GET /health/ready - readiness
- [ ] GET /health/live - liveness

## Phase 3: Test Utilities

### 3.1 Test Database
- [ ] Setup test database
- [ ] Migration runner
- [ ] Seed data helper
- [ ] Cleanup helper

### 3.2 Test Fixtures
- [ ] User factory
- [ ] Organization factory
- [ ] Product factory
- [ ] Model profile factory
- [ ] Scene factory

### 3.3 Mock Services
- [ ] Mock AI provider
- [ ] Mock file upload
- [ ] Mock Prisma (for unit tests)

## Success Criteria

- ✅ Unit test coverage > 70%
- ✅ E2E test coverage for critical paths
- ✅ All tests passing
- ✅ Fast test execution (< 30s for unit, < 2min for E2E)
- ✅ CI/CD ready

## Test Commands

```bash
# Run all tests
npm run test

# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:cov

# Run in watch mode
npm run test:watch
```
