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

  private getChromePath(): string | undefined {
    // Buscar Chrome en ubicaciones comunes de Render/Linux
    const possiblePaths = [
      '/opt/render/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome',
      '/opt/render/project/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome',
      process.env.PUPPETEER_EXECUTABLE_PATH,
    ];

    for (const chromePath of possiblePaths) {
      if (chromePath && fs.existsSync(chromePath)) {
        this.logger.log(`Chrome encontrado en: ${chromePath}`);
        return chromePath;
      }
    }

    return undefined;
  }

  async generatePdf(html: string, fecha: string): Promise<string> {
    this.logger.log('Iniciando generación de PDF');
    let browser: puppeteer.Browser | undefined;

    try {
      const executablePath = this.getChromePath();

      this.logger.log(`Executable path: ${executablePath || 'default'}`);

      // 🚀 Puppeteer compatible con Render / Docker
      browser = await puppeteer.launch({
        headless: true,
        executablePath: executablePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process',
          '--no-zygote',
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
