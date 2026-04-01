import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn", "debug", "verbose"],
    bodyParser: false,
  });
  const http = app.getHttpAdapter().getInstance();
  http.use(json({ limit: "3mb" }));
  http.use(urlencoded({ extended: true, limit: "3mb" }));
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  });
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`API listening on port ${port}`, "Bootstrap");
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to bootstrap NestJS application", err);
  process.exit(1);
});

