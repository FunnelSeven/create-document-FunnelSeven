import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeneratePdfDto {
  @ApiProperty({
    description: 'HTML completo del documento a convertir en PDF',
    example: '<!DOCTYPE html><html><body><h1>Reporte de Ventas</h1></body></html>',
  })
  @IsString()
  @IsNotEmpty()
  html: string;

  @ApiProperty({
    description: 'Fecha del reporte',
    example: '20/1/2026',
  })
  @IsString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({
    description: 'Total de ventas',
    example: 1,
  })
  @IsNotEmpty()
  total_ventas: number;
}
