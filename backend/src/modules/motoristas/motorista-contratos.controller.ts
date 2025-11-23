import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MotoristaContratosService } from './motorista-contratos.service';
import { MotoristaAuthGuard } from '../../common/guards/motorista-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface MotoristaUser {
  id: string;
  type: string;
}

@Controller('motorista/contratos')
@UseGuards(MotoristaAuthGuard)
export class MotoristaContratosController {
  constructor(private readonly contratosService: MotoristaContratosService) {}

  @Get()
  async getContratos(@CurrentUser() user: MotoristaUser) {
    return this.contratosService.getContratos(user.id);
  }

  @Get(':id')
  async getContrato(
    @CurrentUser() user: MotoristaUser,
    @Param('id') id: string,
  ) {
    return this.contratosService.getContrato(user.id, id);
  }
}
