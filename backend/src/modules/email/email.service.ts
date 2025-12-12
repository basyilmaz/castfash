import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private isDevelopmentMode: boolean = false;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailUser = this.configService.get('EMAIL_USER');
    const emailPassword = this.configService.get('EMAIL_PASSWORD');

    // If no credentials, use development mode (log emails instead of sending)
    if (!emailUser || !emailPassword) {
      this.isDevelopmentMode = true;
      this.logger.warn(
        '⚠️ EMAIL_USER or EMAIL_PASSWORD not set. Running in development mode - emails will be logged instead of sent.',
      );
      return;
    }

    const emailConfig = {
      host: this.configService.get('EMAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get('EMAIL_PORT', 587),
      secure: this.configService.get('EMAIL_SECURE', 'false') === 'true',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
    this.logger.log('✅ Email transporter initialized successfully');
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    // Development mode - just log the email
    if (this.isDevelopmentMode) {
      this.logger.log(`📧 [DEV MODE] Would send email to: ${options.to}`);
      this.logger.log(`   Subject: ${options.subject}`);
      this.logger.debug(
        `   HTML Preview: ${options.html.substring(0, 200)}...`,
      );
      return true; // Pretend it was sent successfully
    }

    try {
      const mailOptions = {
        from: this.configService.get(
          'EMAIL_FROM',
          'Castfash <noreply@castfash.com>',
        ),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
      };

      await this.transporter!.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  // Password Reset Email
  async sendPasswordResetEmail(
    userEmail: string,
    resetToken: string,
  ): Promise<boolean> {
    const resetUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3003')}/auth/reset-password?token=${resetToken}`;
    const subject = '🔐 Şifre Sıfırlama Talebi - Castfash';
    const html = this.getPasswordResetTemplate(resetUrl);

    return this.sendEmail({ to: userEmail, subject, html });
  }

  // Email Verification
  async sendVerificationEmail(
    userEmail: string,
    verifyToken: string,
  ): Promise<boolean> {
    const verifyUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3003')}/auth/verify-email?token=${verifyToken}`;
    const subject = '✉️ E-posta Doğrulama - Castfash';
    const html = this.getEmailVerificationTemplate(verifyUrl);

    return this.sendEmail({ to: userEmail, subject, html });
  }

  // Welcome Email after signup
  async sendWelcomeEmail(
    userEmail: string,
    userName?: string,
  ): Promise<boolean> {
    const subject = '🎉 Hoş Geldiniz! - Castfash';
    const html = this.getWelcomeTemplate(userName);

    return this.sendEmail({ to: userEmail, subject, html });
  }

  async sendTrainingCompletedEmail(
    userEmail: string,
    modelName: string,
    metrics?: any,
  ): Promise<boolean> {
    const subject = `✅ Model Eğitimi Tamamlandı - ${modelName}`;
    const html = this.getTrainingCompletedTemplate(modelName, metrics);

    return this.sendEmail({ to: userEmail, subject, html });
  }

  async sendTrainingFailedEmail(
    userEmail: string,
    modelName: string,
    error: string,
  ): Promise<boolean> {
    const subject = `❌ Model Eğitimi Başarısız - ${modelName}`;
    const html = this.getTrainingFailedTemplate(modelName, error);

    return this.sendEmail({ to: userEmail, subject, html });
  }

  async sendGenerationCompletedEmail(
    userEmail: string,
    generationId: number,
  ): Promise<boolean> {
    const subject = `✅ Görsel Üretimi Tamamlandı`;
    const html = this.getGenerationCompletedTemplate(generationId);

    return this.sendEmail({ to: userEmail, subject, html });
  }

  async sendLowCreditWarningEmail(
    userEmail: string,
    currentCredits: number,
  ): Promise<boolean> {
    const subject = `⚠️ Kredi Bakiyeniz Azalıyor`;
    const html = this.getLowCreditWarningTemplate(currentCredits);

    return this.sendEmail({ to: userEmail, subject, html });
  }

  private getTrainingCompletedTemplate(
    modelName: string,
    metrics?: any,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #EFFB53 0%, #514DE0 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: #000; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .metrics { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .metric { display: inline-block; margin: 10px 20px; }
            .metric-label { font-size: 12px; color: #666; }
            .metric-value { font-size: 24px; font-weight: bold; color: #EFFB53; }
            .button { display: inline-block; padding: 12px 30px; background: #EFFB53; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Model Eğitimi Tamamlandı!</h1>
            </div>
            <div class="content">
              <p>Merhaba,</p>
              <p><strong>${modelName}</strong> modelinizin eğitimi başarıyla tamamlandı!</p>
              
              ${
                metrics
                  ? `
                <div class="metrics">
                  <h3>Eğitim Metrikleri</h3>
                  ${
                    metrics.accuracy
                      ? `
                    <div class="metric">
                      <div class="metric-label">Doğruluk</div>
                      <div class="metric-value">${(metrics.accuracy * 100).toFixed(1)}%</div>
                    </div>
                  `
                      : ''
                  }
                  ${
                    metrics.loss
                      ? `
                    <div class="metric">
                      <div class="metric-label">Kayıp</div>
                      <div class="metric-value">${metrics.loss.toFixed(4)}</div>
                    </div>
                  `
                      : ''
                  }
                  ${
                    metrics.epochs
                      ? `
                    <div class="metric">
                      <div class="metric-label">Epoch</div>
                      <div class="metric-value">${metrics.epochs}</div>
                    </div>
                  `
                      : ''
                  }
                </div>
              `
                  : ''
              }
              
              <p>Artık bu modeli kullanarak görsel üretebilirsiniz!</p>
              
              <a href="${this.configService.get('FRONTEND_URL')}/model-profiles" class="button">
                Modeli Görüntüle
              </a>
              
              <p>İyi çalışmalar dileriz!</p>
            </div>
            <div class="footer">
              <p>Castfash - AI Destekli Moda Katalog Platformu</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getTrainingFailedTemplate(modelName: string, error: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: #fff; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .error-box { background: #fff; border-left: 4px solid #ff4444; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #EFFB53; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Model Eğitimi Başarısız</h1>
            </div>
            <div class="content">
              <p>Merhaba,</p>
              <p>Maalesef <strong>${modelName}</strong> modelinizin eğitimi başarısız oldu.</p>
              
              <div class="error-box">
                <strong>Hata Detayı:</strong><br>
                ${error}
              </div>
              
              <p>Lütfen aşağıdaki kontrolleri yapın:</p>
              <ul>
                <li>Yüklediğiniz görsellerin kaliteli ve net olduğundan emin olun</li>
                <li>En az 10-15 farklı görsel yüklediğinizden emin olun</li>
                <li>Görsellerin benzer ışık ve açıda olmasına dikkat edin</li>
              </ul>
              
              <a href="${this.configService.get('FRONTEND_URL')}/model-profiles" class="button">
                Tekrar Dene
              </a>
              
              <p>Sorun devam ederse destek ekibimizle iletişime geçebilirsiniz.</p>
            </div>
            <div class="footer">
              <p>Castfash - AI Destekli Moda Katalog Platformu</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getGenerationCompletedTemplate(generationId: number): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #EFFB53 0%, #514DE0 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: #000; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #EFFB53; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Görsel Üretiminiz Hazır!</h1>
            </div>
            <div class="content">
              <p>Merhaba,</p>
              <p>Görsel üretiminiz başarıyla tamamlandı!</p>
              
              <a href="${this.configService.get('FRONTEND_URL')}/generation/${generationId}" class="button">
                Görseli Görüntüle
              </a>
              
              <p>İyi çalışmalar dileriz!</p>
            </div>
            <div class="footer">
              <p>Castfash - AI Destekli Moda Katalog Platformu</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getLowCreditWarningTemplate(currentCredits: number): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: #fff; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .credit-box { background: #fff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .credit-value { font-size: 48px; font-weight: bold; color: #ffa500; }
            .button { display: inline-block; padding: 12px 30px; background: #EFFB53; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Kredi Bakiyeniz Azalıyor</h1>
            </div>
            <div class="content">
              <p>Merhaba,</p>
              <p>Kredi bakiyeniz azalıyor. Kesintisiz hizmet almak için kredi satın almanızı öneririz.</p>
              
              <div class="credit-box">
                <div>Mevcut Bakiye</div>
                <div class="credit-value">${currentCredits}</div>
                <div>kredi</div>
              </div>
              
              <a href="${this.configService.get('FRONTEND_URL')}/billing" class="button">
                Kredi Satın Al
              </a>
            </div>
            <div class="footer">
              <p>Castfash - AI Destekli Moda Katalog Platformu</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPasswordResetTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #514DE0 0%, #EFFB53 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: #fff; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 40px; background: #EFFB53; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Şifre Sıfırlama</h1>
            </div>
            <div class="content">
              <p>Merhaba,</p>
              <p>Castfash hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
              
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">
                  Şifremi Sıfırla
                </a>
              </p>
              
              <div class="warning">
                <strong>⚠️ Önemli:</strong><br>
                Bu bağlantı 1 saat içinde geçerliliğini yitirecektir.<br>
                Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
              </div>
              
              <p style="font-size: 12px; color: #666;">
                Buton çalışmıyorsa aşağıdaki linki tarayıcınıza yapıştırın:<br>
                <a href="${resetUrl}">${resetUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>Castfash - AI Destekli Moda Katalog Platformu</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getEmailVerificationTemplate(verifyUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981 0%, #EFFB53 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: #fff; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 40px; background: #EFFB53; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✉️ E-posta Doğrulama</h1>
            </div>
            <div class="content">
              <p>Merhaba,</p>
              <p>Castfash hesabınızı aktifleştirmek için lütfen e-posta adresinizi doğrulayın.</p>
              
              <p style="text-align: center;">
                <a href="${verifyUrl}" class="button">
                  E-postamı Doğrula
                </a>
              </p>
              
              <p>Bu bağlantı 24 saat geçerlidir.</p>
              
              <p style="font-size: 12px; color: #666;">
                Buton çalışmıyorsa aşağıdaki linki tarayıcınıza yapıştırın:<br>
                <a href="${verifyUrl}">${verifyUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>Castfash - AI Destekli Moda Katalog Platformu</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getWelcomeTemplate(userName?: string): string {
    const name = userName || 'Değerli Kullanıcımız';
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #EFFB53 0%, #514DE0 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: #000; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { background: #fff; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #EFFB53; }
            .button { display: inline-block; padding: 15px 40px; background: #EFFB53; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .credits { background: #514DE0; color: #fff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .credits-value { font-size: 48px; font-weight: bold; color: #EFFB53; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Hoş Geldiniz!</h1>
            </div>
            <div class="content">
              <p>Merhaba ${name},</p>
              <p>Castfash ailesine hoş geldiniz! AI destekli moda katalog platformumuza kayıt olduğunuz için teşekkür ederiz.</p>
              
              <div class="credits">
                <div>Hoş Geldin Hediyeniz</div>
                <div class="credits-value">20</div>
                <div>ücretsiz kredi</div>
              </div>
              
              <p><strong>Neler yapabilirsiniz?</strong></p>
              
              <div class="feature">
                <strong>📸 Ürün Görselleri</strong><br>
                Ürünlerinizi yükleyin ve AI ile profesyonel katalog görselleri oluşturun.
              </div>
              
              <div class="feature">
                <strong>👗 Model Profilleri</strong><br>
                Farklı model profilleri ile ürünlerinizi sergileyin.
              </div>
              
              <div class="feature">
                <strong>🎬 Sahne Ayarları</strong><br>
                Çeşitli sahne ve arka plan seçenekleri ile görseller oluşturun.
              </div>
              
              <p style="text-align: center;">
                <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:3003')}/dashboard" class="button">
                  Hemen Başla
                </a>
              </p>
              
              <p>Sorularınız mı var? Destek ekibimiz size yardımcı olmaktan mutluluk duyar.</p>
            </div>
            <div class="footer">
              <p>Castfash - AI Destekli Moda Katalog Platformu</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }
}
