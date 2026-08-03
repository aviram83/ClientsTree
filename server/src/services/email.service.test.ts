import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMailMock = vi.fn();
const createTransportMock = vi.fn((..._args: any[]) => ({ sendMail: sendMailMock }));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: (...args: any[]) => createTransportMock(...args),
  },
}));

describe('email.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.GMAIL_USER = 'sender@gmail.com';
    process.env.GMAIL_APP_PASSWORD = 'app-password';
  });

  it('creates a Gmail nodemailer transport with credentials from env vars', async () => {
    await import('./email.service');

    expect(createTransportMock).toHaveBeenCalledWith({
      service: 'gmail',
      auth: { user: 'sender@gmail.com', pass: 'app-password' },
    });
  });

  it('calls sendMail with the recipient, subject, and reset link', async () => {
    sendMailMock.mockResolvedValue(undefined);
    const { emailService } = await import('./email.service');

    await emailService.sendPasswordResetEmail('user@example.com', 'https://app.example.com/reset-password?token=abc');

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'sender@gmail.com',
        to: 'user@example.com',
        subject: expect.any(String),
        html: expect.stringContaining('https://app.example.com/reset-password?token=abc'),
      }),
    );
  });

  it('propagates a rejection from the transport send call', async () => {
    sendMailMock.mockRejectedValue(new Error('SMTP failure'));
    const { emailService } = await import('./email.service');

    await expect(
      emailService.sendPasswordResetEmail('user@example.com', 'https://app.example.com/reset-password?token=abc'),
    ).rejects.toThrow('SMTP failure');
  });

  it('logs a masked (non-plaintext) email address on successful send, never the raw address', async () => {
    sendMailMock.mockResolvedValue(undefined);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { emailService } = await import('./email.service');

    await emailService.sendPasswordResetEmail('user@example.com', 'https://app.example.com/reset-password?token=abc');

    expect(logSpy).toHaveBeenCalledTimes(1);
    const loggedLine = logSpy.mock.calls[0][0] as string;
    expect(loggedLine).not.toContain('user@example.com');
    expect(loggedLine).toMatch(/EMAIL_INFO:.*[0-9a-f]{12}/);

    logSpy.mockRestore();
  });

  it('logs a masked (non-plaintext) email address on a failed send, never the raw address', async () => {
    sendMailMock.mockRejectedValue(new Error('SMTP failure'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { emailService } = await import('./email.service');

    await expect(
      emailService.sendPasswordResetEmail('user@example.com', 'https://app.example.com/reset-password?token=abc'),
    ).rejects.toThrow('SMTP failure');

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const loggedLine = errorSpy.mock.calls[0][0] as string;
    expect(loggedLine).not.toContain('user@example.com');
    expect(loggedLine).toMatch(/EMAIL_ERROR:.*[0-9a-f]{12}/);

    errorSpy.mockRestore();
  });
});
