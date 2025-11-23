import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir arquivos estáticos da pasta uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Log de todas as requisições (DEBUG)
  app.use((req: any, res: any, next: any) => {
    if (req.url.includes('gerar-pdf')) {
      console.log('\n📥 [MIDDLEWARE] Requisição recebida:');
      console.log('   URL:', req.method, req.url);
      console.log('   Headers:', req.headers.authorization ? 'Token presente' : 'SEM TOKEN');
      console.log('');
    }
    next();
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  // API Prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // Port
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(
    `🚀 Application is running on: http://localhost:${port}/${process.env.API_PREFIX || 'api/v1'}`,
  );
}
void bootstrap();
