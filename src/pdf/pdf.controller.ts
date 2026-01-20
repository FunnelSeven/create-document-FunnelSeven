import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GeneratePdfDto } from './dto/generate-pdf.dto';
import { PdfService } from './pdf.service';
import { GhlService } from './ghl.service';

@ApiTags('PDF')
@Controller('api')
export class PdfController {
  private readonly logger = new Logger(PdfController.name);

  constructor(
    private pdfService: PdfService,
    private ghlService: GhlService,
  ) {}

  @Post('generate-pdf')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generar PDF y subir a GoHighLevel' })
  @ApiResponse({
    status: 200,
    description: 'PDF generado y subido exitosamente',
    schema: {
      example: {
        success: true,
        url: 'https://storage.googleapis.com/msgsndr/TiL8cSbIDAsePzT8Chtx/media/696ff93d72b8e135e12d68a1.pdf',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Error al procesar el PDF',
    schema: {
      example: {
        success: false,
        error: 'descripción del error',
      },
    },
  })
  async generateAndUploadPdf(@Body() generatePdfDto: GeneratePdfDto) {
    this.logger.log('Request recibido en /api/generate-pdf');

    let pdfPath: string | undefined;

    try {
      // Generar PDF
      pdfPath = await this.pdfService.generatePdf(
        generatePdfDto.html,
        generatePdfDto.fecha,
      );

      // Subir a GoHighLevel
      const url = await this.ghlService.uploadPdf(pdfPath);

      this.logger.log('PDF generado y subido exitosamente');

      return {
        success: true,
        url,
      };
    } catch (error) {
      this.logger.error(`Error en generateAndUploadPdf: ${error.message}`);

      return {
        success: false,
        error: error.message || 'Error al procesar el PDF',
      };
    } finally {
      // Limpiar archivo temporal
      if (pdfPath) {
        this.pdfService.deletePdfFile(pdfPath);
      }
    }
  }
}
