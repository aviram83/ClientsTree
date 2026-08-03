import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import crypto from 'crypto';
import dns from 'dns';

export interface EmailService {
  sendPasswordResetEmail(to: string, resetLink: string): Promise<void>;
}

const maskEmail = (email: string): string => {
  return crypto.createHash('sha256').update(email).digest('hex').slice(0, 12);
};

class NodemailerGmailEmailService implements EmailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    lookup: (hostname: string, options: dns.LookupOptions, callback: (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family: number) => void) =>
      dns.lookup(hostname, { ...options, family: 4 }, callback),
  } as SMTPTransport.Options);

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const maskedTo = maskEmail(to);
    const gmailUser = process.env.GMAIL_USER?.trim();
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.trim();

    if (!gmailUser || !gmailAppPassword) {
      console.warn(`EMAIL_WARN: skipping password reset email for ${maskedTo} because Gmail credentials are not configured.`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: gmailUser,
        to,
        subject: 'Reset your password',
        html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Click here to reset your password</a></p><p>This link expires in 50 minutes. If you did not request this, you can ignore this email.</p>`,
      });
      console.log(`EMAIL_INFO: Password reset email sent successfully to ${maskedTo}.`);
    } catch (error) {
      const authError = error as { code?: string; responseCode?: number };
      if (authError.code === 'EAUTH' || authError.responseCode === 535) {
        console.warn(`EMAIL_WARN: skipping password reset email for ${maskedTo} because Gmail authentication failed. Update GMAIL_USER and GMAIL_APP_PASSWORD.`);
        return;
      }

      console.error(`EMAIL_ERROR: Failed to send password reset email to ${maskedTo}.`, error);
      throw error;
    }
  }
}

export const emailService: EmailService = new NodemailerGmailEmailService();
