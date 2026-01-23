import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all pages' })
  @ApiResponse({ status: 200, description: 'Returns all pages' })
  async getAll() {
    return this.pagesService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get page by ID' })
  @ApiResponse({ status: 200, description: 'Returns the page' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async getById(@Param('id') id: string) {
    return this.pagesService.getById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get page by slug' })
  @ApiResponse({ status: 200, description: 'Returns the page' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async getBySlug(@Param('slug') slug: string) {
    return this.pagesService.getBySlug(slug);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new page' })
  @ApiResponse({ status: 201, description: 'Page created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() dto: CreatePageDto) {
    return this.pagesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a page' })
  @ApiResponse({ status: 200, description: 'Page updated successfully' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a page' })
  @ApiResponse({ status: 204, description: 'Page deleted successfully' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async delete(@Param('id') id: string) {
    return this.pagesService.delete(id);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed default pages' })
  @ApiResponse({ status: 201, description: 'Pages seeded successfully' })
  async seed() {
    return this.pagesService.seed();
  }
}
