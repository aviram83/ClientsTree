import { BrevoClient } from '@getbrevo/brevo';

export interface EmailService {
  sendPasswordResetEmail(to: string, resetLink: string): Promise<void>;
}

const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
  if (!domain) {
    return '***';
  }
  const visible = localPart.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(localPart.length - visible.length, 3))}@${domain}`;
};

class BrevoEmailService implements EmailService {
  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const maskedTo = maskEmail(to);
    const apiKey = process.env.BREVO_API_KEY?.trim();
    const from = process.env.EMAIL_FROM?.trim();

    if (!apiKey || !from) {
      console.warn(`EMAIL_WARN: skipping password reset email for ${maskedTo} because Brevo credentials are not configured.`);
      return;
    }

    const client = new BrevoClient({ apiKey });

    try {
      await client.transactionalEmails.sendTransacEmail({
        sender: { email: from },
        to: [{ email: to }],
        subject: 'Reset your password',
        htmlContent: `<p>You requested a password reset.</p><p><a href="${resetLink}">Click here to reset your password</a></p><p>This link expires in 50 minutes. If you did not request this, you can ignore this email.</p>`,
      });
      console.log(`EMAIL_INFO: Password reset email sent successfully to ${maskedTo}.`);
    } catch (error) {
      const brevoError = error as { statusCode?: number };
      if (brevoError.statusCode === 401) {
        console.warn(`EMAIL_WARN: skipping password reset email for ${maskedTo} because Brevo authentication failed. Update BREVO_API_KEY and EMAIL_FROM.`);
        return;
      }

      console.error(`EMAIL_ERROR: Failed to send password reset email to ${maskedTo}.`, error);
      throw error;
    }
  }
}

export const emailService: EmailService = new BrevoEmailService();
