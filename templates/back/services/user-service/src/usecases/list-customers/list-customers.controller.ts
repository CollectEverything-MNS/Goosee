import { Controller, Get } from '@nestjs/common';
import { ListCustomersUseCase } from './list-customers.usecase';
import { usersRoutes } from '../../config/routes.config';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class ListCustomersController {
  constructor(private readonly listCustomersUseCase: ListCustomersUseCase) {}

  @Get(`${usersRoutes.root}/customers`)
  @ApiOperation({ summary: 'Liste des clients (CUSTOMER)' })
  async getCustomers() {
    return this.listCustomersUseCase.execute();
  }
}
