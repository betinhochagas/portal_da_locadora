import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MotoristasModule } from './modules/motoristas/motoristas.module';
import { VeiculosModule } from './modules/veiculos/veiculos.module';
import { FiliaisModule } from './modules/filiais/filiais.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MotoristasModule,
    VeiculosModule,
    FiliaisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
