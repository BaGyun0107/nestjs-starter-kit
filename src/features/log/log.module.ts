import { Global, Module } from '@nestjs/common';
import { LoggerService } from 'src/features/log/service/logger.service';

@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService]
})
export class LogModule {}
