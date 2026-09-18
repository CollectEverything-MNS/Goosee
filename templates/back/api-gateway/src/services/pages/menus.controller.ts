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
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PagesService } from './pages.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ReorderMenusDto } from './dto/reorder-menus.dto';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';

@ApiTags('Menus')
@Controller('menus')
export class MenusController {
  constructor(private readonly pagesService: PagesService) {}

  // Lecture publique : la boutique en a besoin pour afficher sa navigation.
  @Get()
  @ApiOperation({ summary: 'Get all menus (hierarchical)' })
  @ApiResponse({ status: 200, description: 'Returns all menus with children' })
  async getAll() {
    return this.pagesService.getAllMenus();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('menu')
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiResponse({ status: 201, description: 'Menu created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() dto: CreateMenuDto) {
    return this.pagesService.createMenu(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('menu')
  @ApiOperation({ summary: 'Update a menu item' })
  @ApiResponse({ status: 200, description: 'Menu updated successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.pagesService.updateMenu(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('menu')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a menu item' })
  @ApiResponse({ status: 204, description: 'Menu deleted successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async delete(@Param('id') id: string) {
    return this.pagesService.deleteMenu(id);
  }

  @Put('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('menu')
  @ApiOperation({ summary: 'Reorder menu items' })
  @ApiResponse({ status: 200, description: 'Menus reordered successfully' })
  async reorder(@Body() dto: ReorderMenusDto) {
    return this.pagesService.reorderMenus(dto);
  }
}
