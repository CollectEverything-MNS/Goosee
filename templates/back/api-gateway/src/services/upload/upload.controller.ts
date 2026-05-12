import {
  BadRequestException,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { routesConfig } from '../../config/routes.config';
import { JwtAuthGuard } from '../../shared/services/jwt-auth.guard';
import { RolesGuard } from '../../shared/services/roles.guard';
import { Roles } from '../../shared/services/roles.decorator';

@ApiTags('Upload')
@Controller()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post(routesConfig.upload.file.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('pages')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: any, @Query('folder') folder?: string) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.uploadService.uploadFile(file, folder);
  }
}
