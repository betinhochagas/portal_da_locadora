import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FiliaisService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.filial.findMany({
      select: {
        id: true,
        name: true,
        cnpj: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
