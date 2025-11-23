import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { MotoristaContratosService } from './motorista-contratos.service';
import { MotoristaAuthGuard } from '../../common/guards/motorista-auth.guard';

@Controller('motorista/contratos')
@UseGuards(MotoristaAuthGuard)
export class MotoristaContratosController {
  constructor(private readonly contratosService: MotoristaContratosService) {}

  @Get()
  async getContratos(@Req() req: any) {
    return this.contratosService.getContratos(req.user.id);
  }

  @Get(':id')
  async getContrato(@Req() req: any, @Param('id') id: string) {
    return this.contratosService.getContrato(req.user.id, id);
  }
}
