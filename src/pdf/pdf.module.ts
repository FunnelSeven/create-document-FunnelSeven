import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { GhlService } from './ghl.service';

@Module({
  imports: [ConfigModule],
  controllers: [PdfController],
  providers: [PdfService, GhlService],
})
export class PdfModule {}
