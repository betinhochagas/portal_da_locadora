import { Controller, Get, UseGuards } from '@nestjs/common';
import { MotoristaDashboardService } from './motorista-dashboard.service';
import { MotoristaAuthGuard } from '../../common/guards/motorista-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface MotoristaUser {
  id: string;
  type: 'motorista';
}

@Controller('motorista/dashboard')
@UseGuards(MotoristaAuthGuard)
export class MotoristaDashboardController {
  constructor(private readonly dashboardService: MotoristaDashboardService) {}

  @Get()
  async getDashboard(@CurrentUser() user: MotoristaUser) {
    return this.dashboardService.getDashboardData(user.id);
  }
}
