import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { dirname, resolve } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const dbPath = process.env.DATABASE_PATH || './data/dazzle.db';
  const dataDir = resolve(process.cwd(), dirname(dbPath));
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  const corsOrigin = process.env.CORS_ORIGIN;
  const origins = corsOrigin
    ? corsOrigin.split(',').map((o) => o.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:8080', 'http://127.0.0.1:8080'];
  app.enableCors({
    origin: origins.length === 1 ? origins[0] : origins,
    credentials: true,
  });
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend running at http://localhost:${port}`);
  if (process.env.DATABASE_URL) {
    const kind = process.env.DATABASE_URL.startsWith('mongodb') ? 'MongoDB' : 'PostgreSQL';
    console.log(`Remote DB (${kind}) configured – local syncs FROM live (startup + every 5 min).`);
  }
}
bootstrap();
