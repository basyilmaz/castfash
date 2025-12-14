import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SeederService } from './modules/seeder/seeder.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // CORS configuration - more secure than { cors: true }
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3003',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true,
    maxAge: 86400, // 24 hours
  });

  // Security headers middleware
  app.use((req: any, res: any, next: any) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Remove X-Powered-By
    res.removeHeader('X-Powered-By');
    next();
  });

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = error.constraints
            ? Object.values(error.constraints)
            : [];
          return `${error.property}: ${constraints.join(', ')}`;
        });
        return {
          statusCode: 400,
          message: messages,
          error: 'Validation Error',
        };
      },
    }),
  );

  // Swagger Configuration
  if (process.env.MODE !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('CastFash API')
      .setDescription('The CastFash Studio API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(process.env.PORT || 3002);

  // Run seeder to ensure default data
  try {
    const seederService = app.get(SeederService);
    await seederService.ensureProductCategories();
    logger.log('✅ Default categories seeded');
  } catch (error) {
    logger.warn('⚠️ Seeder warning:', error.message);
  }

  Logger.log(
    `🚀 Application is running on: http://localhost:${process.env.PORT || 3002}`,
  );
  if (process.env.MODE !== 'production') {
    Logger.log(
      `📚 Swagger documentation: http://localhost:${process.env.PORT || 3002}/api/docs`,
    );
  }
  logger.log(`📝 Environment: ${process.env.MODE || 'development'}`);
}

bootstrap();
