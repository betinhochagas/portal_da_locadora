import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadDocumentoDto } from './dto/upload-documento.dto';
import type { StorageAdapter } from '../storage/storage.interface';
import { STORAGE_ADAPTER } from '../storage/storage.module';

@Injectable()
export class UploadsService {
  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_ADAPTER) private storageAdapter: StorageAdapter,
  ) {}

  async uploadDocumento(
    file: Express.Multer.File,
    dto: UploadDocumentoDto,
    uploadedBy: string,
  ) {
    // Validar que pelo menos uma entidade foi especificada
    if (!dto.motoristaId && !dto.veiculoId && !dto.contratoId) {
      throw new BadRequestException(
        'Deve especificar motoristaId, veiculoId ou contratoId',
      );
    }

    // Validar que apenas uma entidade foi especificada
    const entityCount = [dto.motoristaId, dto.veiculoId, dto.contratoId].filter(
      Boolean,
    ).length;

    if (entityCount > 1) {
      throw new BadRequestException(
        'Pode especificar apenas uma entidade (motorista, veiculo ou contrato)',
      );
    }

    // Save file using storage adapter
    const fileUrl = await this.storageAdapter.saveFile(file, file.filename);

    // Criar registro no banco
    const documento = await this.prisma['documentoDigital'].create({
      data: {
        tipo: dto.tipo,
        nomeArquivo: file.filename,
        nomeOriginal: file.originalname,
        tamanho: file.size,
        mimeType: file.mimetype,
        url: fileUrl,
        motoristaId: dto.motoristaId,
        veiculoId: dto.veiculoId,
        contratoId: dto.contratoId,
        uploadedBy,
      },
      include: {
        motorista: { select: { id: true, name: true } },
        veiculo: {
          select: { id: true, plate: true, brand: true, model: true },
        },
        contrato: { select: { id: true, contractNumber: true } },
      },
    });

    return documento;
  }

  async findAll(filters?: {
    motoristaId?: string;
    veiculoId?: string;
    contratoId?: string;
    tipo?: string;
  }) {
    const where: Record<string, unknown> = {};

    if (filters?.motoristaId) where.motoristaId = filters.motoristaId;
    if (filters?.veiculoId) where.veiculoId = filters.veiculoId;
    if (filters?.contratoId) where.contratoId = filters.contratoId;
    if (filters?.tipo) where.tipo = filters.tipo;

    return this.prisma['documentoDigital'].findMany({
      where,
      include: {
        motorista: { select: { id: true, name: true } },
        veiculo: {
          select: { id: true, plate: true, brand: true, model: true },
        },
        contrato: { select: { id: true, contractNumber: true } },
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const documento = await this.prisma['documentoDigital'].findUnique({
      where: { id },
      include: {
        motorista: { select: { id: true, name: true } },
        veiculo: {
          select: { id: true, plate: true, brand: true, model: true },
        },
        contrato: { select: { id: true, contractNumber: true } },
      },
    });

    if (!documento) {
      throw new NotFoundException(`Documento ${id} não encontrado`);
    }

    return documento;
  }

  async remove(id: string) {
    const documento = await this.findOne(id);

    // Delete file using storage adapter
    await this.storageAdapter.deleteFile(documento.nomeArquivo);

    // Remover registro do banco
    await this.prisma['documentoDigital'].delete({
      where: { id },
    });

    return { message: 'Documento removido com sucesso' };
  }

  async getFilePath(id: string): Promise<string> {
    const documento = await this.findOne(id);
    return this.storageAdapter.getFilePath(documento.nomeArquivo);
  }
}
