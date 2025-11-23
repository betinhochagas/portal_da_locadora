import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { MotoristaAuthService } from './motorista-auth.service';
import { MotoristaAuthGuard } from '../../common/guards/motorista-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  MotoristaLoginDto,
  MotoristaPrimeiroAcessoDto,
  MotoristaEsqueciSenhaDto,
} from './dto/motorista-auth.dto';

interface MotoristaUser {
  id: string;
  type: string;
}

@Controller('auth/motorista')
export class MotoristaAuthController {
  constructor(private motoristaAuthService: MotoristaAuthService) {}

  @Post('login')
  async login(@Body() dto: MotoristaLoginDto) {
    return this.motoristaAuthService.login(dto);
  }

  @Post('primeiro-acesso')
  @UseGuards(MotoristaAuthGuard)
  async primeiroAcesso(
    @CurrentUser() user: MotoristaUser,
    @Body() dto: MotoristaPrimeiroAcessoDto,
  ) {
    return this.motoristaAuthService.primeiroAcesso(user.id, dto);
  }

  @Post('esqueci-senha')
  async esqueciSenha(@Body() dto: MotoristaEsqueciSenhaDto) {
    return this.motoristaAuthService.esqueciSenha(dto);
  }

  @Post('reset-senha')
  resetSenha() {
    return this.motoristaAuthService.resetSenha();
  }

  @Get('profile')
  @UseGuards(MotoristaAuthGuard)
  getProfile(@CurrentUser() user: MotoristaUser) {
    return user;
  }
}
