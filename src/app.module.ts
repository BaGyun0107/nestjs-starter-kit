import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AuthModule } from './features/auth/auth.module';
import { LoggerService } from './features/log/service/logger.service';
import { LogModule } from './features/log/log.module';
import { PrismaModule } from './database/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
      load: [configuration]
    }),
    PrismaModule,
    AuthModule,
    LogModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: LoggerService,
      useFactory: (configService: ConfigService) => {
        return new LoggerService(configService);
      },
      inject: [ConfigService]
    }
  ]
})
export class AppModule {}
