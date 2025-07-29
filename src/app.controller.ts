import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get('health')
  getHealth(): string {
    console.log('health check');
    return 'OK';
  }
}
