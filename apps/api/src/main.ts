import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  console.log('Starting application...');

  try {
    console.log('Creating NestFactory...');
    const app = await NestFactory.create(AppModule);
    console.log('NestFactory created successfully');

    // Enable CORS for frontend
    app.enableCors({
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
    });

    // Enable validation
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    const port = process.env.PORT ?? 3001;
    console.log(`Starting server on port ${port}...`);
    await app.listen(port);
    console.log(`Backend running on http://localhost:${port}`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}
bootstrap();
