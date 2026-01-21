import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly tempDir = path.join(process.cwd(), 'temp');

  constructor() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async generatePdf(html: string, fecha: string): Promise<string> {
    this.logger.log('Iniciando generación de PDF');
    let browser: puppeteer.Browser | undefined;

    try {
      // 🚀 Puppeteer compatible con Render / Docker
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process',
        ],
      });

      this.logger.log('Browser de Puppeteer iniciado');

      const page = await browser.newPage();

      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      const timestamp = Date.now();
      const fechaFormato = fecha.replace(/\//g, '');
      const filename = `reporte_${fechaFormato}_${timestamp}.pdf`;
      const filePath = path.join(this.tempDir, filename);

      this.logger.log(`Generando PDF: ${filename}`);

      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });

      this.logger.log(`PDF generado exitosamente: ${filePath}`);
      return filePath;
    } catch (error: any) {
      this.logger.error(
        `Error al generar PDF: ${error.message}`,
        error.stack,
      );
      throw error;
    } finally {
      if (browser) {
        await browser.close();
        this.logger.log('Browser de Puppeteer cerrado');
      }
    }
  }

  deletePdfFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Archivo temporal eliminado: ${filePath}`);
      }
    } catch (error: any) {
      this.logger.warn(
        `No se pudo eliminar archivo: ${filePath}`,
        error.message,
      );
    }
  }
}
