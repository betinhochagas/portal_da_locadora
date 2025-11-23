import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { MotoristaPagamentosService } from './motorista-pagamentos.service';
import { MotoristaAuthGuard } from '../../common/guards/motorista-auth.guard';

@Controller('motorista/pagamentos')
@UseGuards(MotoristaAuthGuard)
export class MotoristaPagamentosController {
  constructor(
    private readonly pagamentosService: MotoristaPagamentosService,
  ) {}

  @Get()
  async getPagamentos(@Req() req: any) {
    return this.pagamentosService.getPagamentos(req.user.id);
  }
}
