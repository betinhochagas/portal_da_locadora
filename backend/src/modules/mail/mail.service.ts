import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.createTransporter();
  }

  private createTransporter() {
    // Configuração do transporter (Gmail, SMTP, etc.)
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: process.env.MAIL_SECURE === 'true', // true para 465, false para outras portas
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    this.logger.log('Mail transporter criado com sucesso');
  }

  /**
   * Envia email com PDF do contrato anexado
   */
  async enviarContratoPDF(
    destinatario: string,
    nomeDestinatario: string,
    numeroContrato: string,
    pdfBuffer: Buffer,
  ): Promise<void> {
    try {
      this.logger.log(`Enviando contrato ${numeroContrato} para ${destinatario}`);

      const info = await this.transporter.sendMail({
        from: `"Portal da Locadora" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
        to: destinatario,
        subject: `Contrato de Locação - ${numeroContrato}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Contrato de Locação de Veículo</h2>
            
            <p>Olá <strong>${nomeDestinatario}</strong>,</p>
            
            <p>Segue anexo o contrato de locação número <strong>${numeroContrato}</strong>.</p>
            
            <p>Por favor, guarde este documento para consultas futuras.</p>
            
            <div style="margin: 30px 0; padding: 20px; background-color: #F3F4F6; border-radius: 8px;">
              <p style="margin: 0; color: #6B7280; font-size: 14px;">
                📄 O PDF está anexado a este email<br>
                📧 Em caso de dúvidas, responda este email
              </p>
            </div>
            
            <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
              Portal da Locadora<br>
              Sistema de Gestão de Frota
            </p>
          </div>
        `,
        attachments: [
          {
            filename: `contrato-${numeroContrato}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      this.logger.log(`Email enviado com sucesso: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar email: ${error.message}`, error.stack);
      throw new Error('Falha ao enviar email. Verifique as configurações de SMTP.');
    }
  }

  /**
   * Verifica se o serviço de email está configurado e funcionando
   */
  async verificarConexao(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Conexão com servidor de email verificada com sucesso');
      return true;
    } catch (error) {
      this.logger.error(`Erro ao verificar conexão de email: ${error.message}`);
      return false;
    }
  }
}
