import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { DirectoryController } from "./directory.controller";

@Module({
  imports: [PrismaModule],
  controllers: [DirectoryController]
})
export class DirectoryModule {}

