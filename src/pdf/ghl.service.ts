import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class GhlService {
  private readonly logger = new Logger(GhlService.name);
  private readonly apiKey: string;
  private readonly locationId: string;
  private readonly apiUrl = 'https://services.leadconnectorhq.com/medias/upload-file';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GHL_API_KEY')!;
    this.locationId = this.configService.get<string>('GHL_LOCATION_ID')!;

    if (!this.apiKey || !this.locationId) {
      throw new Error('GHL_API_KEY y GHL_LOCATION_ID son requeridas');
    }
  }

  async uploadPdf(filePath: string): Promise<string> {
    this.logger.log(`Iniciando subida a GoHighLevel: ${filePath}`);
    this.logger.log(`Location ID: ${this.locationId}`);
    this.logger.log(`API Key (primeros 10 chars): ${this.apiKey.substring(0, 10)}...`);

    try {
      const fileStream = fs.createReadStream(filePath);
      const form = new FormData();
      form.append('file', fileStream);

      const url = `${this.apiUrl}?locationId=${this.locationId}`;
      this.logger.log(`URL de subida: ${url}`);

      const response = await axios.post(url, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${this.apiKey}`,
          Version: '2021-07-28',
        },
      });

      this.logger.log('PDF subido exitosamente a GoHighLevel');
      this.logger.log(`Respuesta de GHL: ${JSON.stringify(response.data)}`);

      const fileUrl = response.data?.fileUrl || response.data?.url;
      if (!fileUrl) {
        throw new Error('No se recibió URL del archivo en la respuesta de GHL');
      }

      this.logger.log(`URL del documento: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      if (error.response) {
        this.logger.error(`Error HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      }
      this.logger.error(
        `Error al subir PDF a GoHighLevel: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
