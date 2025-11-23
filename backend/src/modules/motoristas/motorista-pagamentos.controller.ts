import { Controller, Get, UseGuards } from '@nestjs/common';
import { MotoristaPagamentosService } from './motorista-pagamentos.service';
import { MotoristaAuthGuard } from '../../common/guards/motorista-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface MotoristaUser {
  id: string;
  type: string;
}

@Controller('motorista/pagamentos')
@UseGuards(MotoristaAuthGuard)
export class MotoristaPagamentosController {
  constructor(private readonly pagamentosService: MotoristaPagamentosService) {}

  @Get()
  async getPagamentos(@CurrentUser() user: MotoristaUser) {
    return this.pagamentosService.getPagamentos(user.id);
  }
}
