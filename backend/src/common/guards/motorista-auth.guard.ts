import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MotoristaAuthGuard extends AuthGuard('motorista-jwt') {}
