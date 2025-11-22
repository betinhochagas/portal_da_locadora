import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CobrancasService } from './cobrancas.service';
import { CreateCobrancaDto } from './dto/create-cobranca.dto';
import { UpdateCobrancaDto } from './dto/update-cobranca.dto';
import { RegistrarPagamentoDto } from './dto/registrar-pagamento.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('cobrancas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CobrancasController {
  constructor(private readonly cobrancasService: CobrancasService) {}

  @Post()
  @Roles('ADMIN', 'DIRETORIA', 'FINANCEIRO', 'GERENTE_LOJA')
  create(@Body() createCobrancaDto: CreateCobrancaDto) {
    return this.cobrancasService.create(createCobrancaDto);
  }

  @Get()
  @Roles('ADMIN', 'DIRETORIA', 'FINANCEIRO', 'GERENTE_LOJA', 'ATENDENTE')
  findAll(
    @Query('contratoId') contratoId?: string,
    @Query('status') status?: string,
  ) {
    return this.cobrancasService.findAll(contratoId, status);
  }

  @Get('inadimplentes')
  @Roles('ADMIN', 'DIRETORIA', 'FINANCEIRO', 'GERENTE_LOJA')
  getInadimplentes() {
    return this.cobrancasService.getInadimplentes();
  }

  @Get(':id')
  @Roles('ADMIN', 'DIRETORIA', 'FINANCEIRO', 'GERENTE_LOJA', 'ATENDENTE')
  findOne(@Param('id') id: string) {
    return this.cobrancasService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DIRETORIA', 'FINANCEIRO', 'GERENTE_LOJA')
  update(
    @Param('id') id: string,
    @Body() updateCobrancaDto: UpdateCobrancaDto,
  ) {
    return this.cobrancasService.update(id, updateCobrancaDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'DIRETORIA')
  remove(@Param('id') id: string) {
    return this.cobrancasService.remove(id);
  }

  @Post(':id/registrar-pagamento')
  @Roles('ADMIN', 'DIRETORIA', 'FINANCEIRO', 'GERENTE_LOJA', 'ATENDENTE')
  registrarPagamento(
    @Param('id') id: string,
    @Body() dto: RegistrarPagamentoDto,
  ) {
    return this.cobrancasService.registrarPagamento(id, dto);
  }

  @Post('gerar-mensais')
  @Roles('ADMIN', 'DIRETORIA', 'FINANCEIRO')
  gerarCobrancasMensais() {
    return this.cobrancasService.gerarCobrancasMensais();
  }

  @Post('atualizar-atrasadas')
  @Roles('ADMIN', 'DIRETORIA', 'FINANCEIRO')
  atualizarStatusAtrasadas() {
    return this.cobrancasService.atualizarStatusAtrasadas();
  }
}
