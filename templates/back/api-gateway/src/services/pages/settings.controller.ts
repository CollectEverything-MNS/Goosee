import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PagesService } from './pages.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get site settings' })
  @ApiResponse({ status: 200, description: 'Returns site settings' })
  async get() {
    return this.pagesService.getSettings();
  }

  @Put()
  @ApiOperation({ summary: 'Update site settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async update(@Body() dto: UpdateSettingsDto) {
    return this.pagesService.updateSettings(dto);
  }
}
