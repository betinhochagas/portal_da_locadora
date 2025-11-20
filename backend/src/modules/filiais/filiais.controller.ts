import { Controller, Get, UseGuards } from '@nestjs/common';
import { FiliaisService } from './filiais.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('filiais')
@UseGuards(JwtAuthGuard)
export class FiliaisController {
  constructor(private readonly filiaisService: FiliaisService) {}

  @Get()
  findAll() {
    return this.filiaisService.findAll();
  }
}
