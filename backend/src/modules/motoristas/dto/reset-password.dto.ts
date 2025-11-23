import { IsUUID } from 'class-validator';

export class ResetPasswordDto {
  @IsUUID()
  motoristaId: string;
}
