import { Controller, Get } from '@nestjs/common';
import { GetSettingsUseCase } from './get-settings.usecase';
import { settingsRoutes } from '../../config/routes.config';

@Controller(settingsRoutes.root)
export class GetSettingsController {
  constructor(private readonly getSettingsUseCase: GetSettingsUseCase) {}

  @Get()
  async get() {
    return this.getSettingsUseCase.execute();
  }
}
