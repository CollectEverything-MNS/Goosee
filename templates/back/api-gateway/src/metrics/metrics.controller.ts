import { Controller, Get, Header } from '@nestjs/common';
import { collectDefaultMetrics, register } from 'prom-client';
// Import pour effet de bord : enregistre les métriques HTTP RED sur le `register`.
import './http-metrics';

collectDefaultMetrics();

@Controller('metrics')
export class MetricsController {
  @Get()
  @Header('Content-Type', register.contentType)
  metrics(): Promise<string> {
    return register.metrics();
  }
}
