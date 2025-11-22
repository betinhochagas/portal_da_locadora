import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.statsService.getDashboardStats();
  }

  @Get('contratos/vencendo')
  async getContratosVencendo(@Query('dias') dias?: string) {
    const diasNum = dias ? parseInt(dias, 10) : 30;
    return this.statsService.getContratosVencendo(diasNum);
  }

  @Get('receita/mensal')
  async getReceitaMensal(@Query('meses') meses?: string) {
    const mesesNum = meses ? parseInt(meses, 10) : 6;
    return this.statsService.getReceitaMensal(mesesNum);
  }

  @Get('frota/distribuicao')
  async getDistribuicaoFrota() {
    return this.statsService.getDistribuicaoFrota();
  }
}
