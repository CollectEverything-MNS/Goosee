import { Body, Controller, Put } from '@nestjs/common';
import { UpdateSettingsUseCase } from './update-settings.usecase';
import { UpdateSettingsDto } from './update-settings.dto';
import { settingsRoutes } from '../../config/routes.config';

@Controller(settingsRoutes.root)
export class UpdateSettingsController {
  constructor(private readonly updateSettingsUseCase: UpdateSettingsUseCase) {}

  @Put()
  async update(@Body() dto: UpdateSettingsDto) {
    return this.updateSettingsUseCase.execute(dto);
  }
}
