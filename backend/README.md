# CastFash Studio Backend

CastFash Studio is an AI-powered fashion photography platform. This is the backend service built with **NestJS**.

## 🚀 Features

- **Authentication**: JWT-based auth with refresh tokens.
- **AI Generation**: Integration with KIE, Replicate, and FAL AI providers.
- **Product Management**: Manage products, categories, and model profiles.
- **File Upload**: Secure file upload with type and size validation.
- **Performance**: Database indexing and Redis-ready caching structure.
- **Security**: Rate limiting, Helmet, CORS, and input validation.
- **Monitoring**: Health checks and structured logging.
- **Documentation**: Swagger/OpenAPI integration.

## 🛠 Prerequisites

- Node.js (v18+)
- PostgreSQL
- npm or yarn

## ⚙️ Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd castfash/backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Copy `.env.example` to `.env` and fill in the required values:
    ```bash
    cp .env.example .env
    ```
    *See `.env.example` for detailed configuration options.*

4.  **Database Setup:**
    ```bash
    # Generate Prisma client
    npx prisma generate

    # Run migrations
    npx prisma migrate deploy
    ```

## 🏃‍♂️ Running the Application

### Development
```bash
npm run start:dev
```
*Server will start at `http://localhost:3002`*
*Swagger Docs: `http://localhost:3002/api/docs`*

### Production
```bash
npm run build
npm run start:prod
```

## 🧪 Testing

The project includes a comprehensive testing suite.

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 📚 API Documentation

Swagger UI is available in development mode at:
`http://localhost:3002/api/docs`

### Key Endpoints

- **Auth**: `/auth/signup`, `/auth/login`, `/auth/refresh`
- **Products**: `/products`
- **Generation**: `/products/:id/generate`
- **Health**: `/health`, `/health/ready`, `/health/live`

## 🔒 Security Features

- **Rate Limiting**:
  - Global: 100 req/min
  - Generation: 10 req/min
  - Batch: 5 req/min
- **Input Validation**: Strict DTO validation with Zod/Class-Validator.
- **File Security**: 10MB limit, strict mime-type checks.

## 🏗 Architecture

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod & class-validator
- **Logging**: Custom Logger Service
- **Error Handling**: Global Exception Filter

## 🤝 Contributing

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add some amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request
