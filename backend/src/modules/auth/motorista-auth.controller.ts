import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { MotoristaAuthService } from './motorista-auth.service';
import { MotoristaAuthGuard } from '../../common/guards/motorista-auth.guard';
import {
  MotoristaLoginDto,
  MotoristaPrimeiroAcessoDto,
  MotoristaEsqueciSenhaDto,
  MotoristaResetSenhaDto,
} from './dto/motorista-auth.dto';

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
    @Req() req: any,
    @Body() dto: MotoristaPrimeiroAcessoDto,
  ) {
    return this.motoristaAuthService.primeiroAcesso(req.user.id, dto);
  }

  @Post('esqueci-senha')
  async esqueciSenha(@Body() dto: MotoristaEsqueciSenhaDto) {
    return this.motoristaAuthService.esqueciSenha(dto);
  }

  @Post('reset-senha')
  async resetSenha(@Body() dto: MotoristaResetSenhaDto) {
    return this.motoristaAuthService.resetSenha(dto);
  }

  @Get('profile')
  @UseGuards(MotoristaAuthGuard)
  async getProfile(@Req() req: any) {
    return req.user;
  }
}
