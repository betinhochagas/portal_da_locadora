import { IsUUID, IsString } from 'class-validator';

export class ChangeVehicleDto {
  @IsUUID('4', { message: 'ID do novo veículo inválido' })
  newVeiculoId: string;

  @IsString()
  reason: string;
}
