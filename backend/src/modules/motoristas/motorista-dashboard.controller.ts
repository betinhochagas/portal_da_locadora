import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { MotoristaDashboardService } from './motorista-dashboard.service';
import { MotoristaAuthGuard } from '../../common/guards/motorista-auth.guard';

@Controller('motorista/dashboard')
@UseGuards(MotoristaAuthGuard)
export class MotoristaDashboardController {
  constructor(private readonly dashboardService: MotoristaDashboardService) {}

  @Get()
  async getDashboard(@Req() req: any) {
    return this.dashboardService.getDashboardData(req.user.id);
  }
}
