import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>("FRONTEND_URL", "http://localhost:5173");
  const port = configService.get<number>("PORT", 3001);

  app.enableCors({
    origin: [frontendUrl],
    credentials: true,
  });
  app.setGlobalPrefix("api");

  await app.listen(port);
}

void bootstrap();
