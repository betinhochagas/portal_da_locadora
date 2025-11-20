import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FiliaisService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.filial.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
