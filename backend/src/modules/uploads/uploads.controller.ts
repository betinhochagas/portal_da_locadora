import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';
import { UploadsService } from './uploads.service';
import { UploadDocumentoDto } from './dto/upload-documento.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.ADMIN,
    Role.DIRETORIA,
    Role.GERENTE_LOJA,
    Role.ATENDENTE,
    Role.FINANCEIRO,
    Role.GESTOR_FROTA,
  )
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
      },
      fileFilter: (_req, file, cb) => {
        // Aceitar apenas imagens e PDFs
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'application/pdf',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Tipo de arquivo não permitido. Apenas imagens (JPEG, PNG, GIF) e PDF são aceitos.',
            ),
            false,
          );
        }
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentoDto,
    @CurrentUser() user: { id: string },
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    // Ensure filename is set (multer diskStorage sets this automatically)
    if (!file.filename) {
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      file.filename = `${randomName}${extname(file.originalname)}`;
    }

    return this.uploadsService.uploadDocumento(file, dto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll(
    @Query('motoristaId') motoristaId?: string,
    @Query('veiculoId') veiculoId?: string,
    @Query('contratoId') contratoId?: string,
    @Query('tipo') tipo?: string,
  ) {
    return this.uploadsService.findAll({
      motoristaId,
      veiculoId,
      contratoId,
      tipo,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id') id: string) {
    return this.uploadsService.findOne(id);
  }

  // Endpoints públicos para download e visualização (não requerem autenticação)
  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const filePath = await this.uploadsService.getFilePath(id);
    const documento = await this.uploadsService.findOne(id);

    res.setHeader('Content-Type', documento.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${documento.nomeOriginal}"`,
    );
    res.sendFile(filePath);
  }

  @Get(':id/view')
  async view(@Param('id') id: string, @Res() res: Response) {
    const filePath = await this.uploadsService.getFilePath(id);
    const documento = await this.uploadsService.findOne(id);

    // Para visualização (não força download)
    res.setHeader('Content-Type', documento.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${documento.nomeOriginal}"`,
    );
    res.sendFile(filePath);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DIRETORIA, Role.GERENTE_LOJA)
  remove(@Param('id') id: string) {
    return this.uploadsService.remove(id);
  }
}
