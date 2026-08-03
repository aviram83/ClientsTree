import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendTransacEmailMock = vi.fn();
const brevoConstructorMock = vi.fn();

vi.mock('@getbrevo/brevo', () => ({
  BrevoClient: class {
    constructor(...args: any[]) {
      brevoConstructorMock(...args);
    }
    transactionalEmails = { sendTransacEmail: (...args: any[]) => sendTransacEmailMock(...args) };
  },
}));

describe('email.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.BREVO_API_KEY = 'brevo_test_key';
    process.env.EMAIL_FROM = 'sender@example.com';
  });

  it('creates a Brevo client with the API key from env vars', async () => {
    sendTransacEmailMock.mockResolvedValue({});
    const { emailService } = await import('./email.service');

    await emailService.sendPasswordResetEmail('user@example.com', 'https://app.example.com/reset-password?token=abc');

    expect(brevoConstructorMock).toHaveBeenCalledWith({ apiKey: 'brevo_test_key' });
  });

  it('calls sendTransacEmail with the recipient, subject, and reset link', async () => {
    sendTransacEmailMock.mockResolvedValue({});
    const { emailService } = await import('./email.service');

    await emailService.sendPasswordResetEmail('user@example.com', 'https://app.example.com/reset-password?token=abc');

    expect(sendTransacEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sender: { email: 'sender@example.com' },
        to: [{ email: 'user@example.com' }],
        subject: expect.any(String),
        htmlContent: expect.stringContaining('https://app.example.com/reset-password?token=abc'),
      }),
    );
  });

  it('propagates a rejection from the send call', async () => {
    sendTransacEmailMock.mockRejectedValue(new Error('Brevo failure'));
    const { emailService } = await import('./email.service');

    await expect(
      emailService.sendPasswordResetEmail('user@example.com', 'https://app.example.com/reset-password?token=abc'),
    ).rejects.toThrow('Brevo failure');
  });

  it('skips sending when Brevo credentials are missing', async () => {
    delete process.env.BREVO_API_KEY;
    delete process.env.EMAIL_FROM;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { emailService } = await import('./email.service');

    await expect(
      emailService.sendPasswordResetEmail('user@example.com', 'https://app.example.com/reset-password?token=abc'),
    ).resolves.toBeUndefined();

    expect(sendTransacEmailMock).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('skipping'));

    warnSpy.mockRestore();
  });

  it('skips (rather than throws) when Brevo reports a 401 auth error', async () => {
    const authError = Object.assign(new Error('Unauthorized'), { statusCode: 401 });
    sendTransacEmailMock.mockRejectedValue(authError);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { emailService } = await import('./email.service');

    await expect(
      emailService.sendPasswordResetEmail('user@example.com', 'https://app.example.com/reset-password?token=abc'),
    ).resolves.toBeUndefined();

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('authentication failed'));

    warnSpy.mockRestore();
  });

  it('logs a partially masked email address on successful send, never the full raw address', async () => {
    sendTransacEmailMock.mockResolvedValue({});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { emailService } = await import('./email.service');

    await emailService.sendPasswordResetEmail('user@example.com', 'https://app.example.com/reset-password?token=abc');

    expect(logSpy).toHaveBeenCalledTimes(1);
    const loggedLine = logSpy.mock.calls[0][0] as string;
    expect(loggedLine).not.toContain('user@example.com');
    expect(loggedLine).toMatch(/EMAIL_INFO:.*us\*+@example\.com/);

    logSpy.mockRestore();
  });

  it('logs a partially masked email address on a failed send, never the full raw address', async () => {
    sendTransacEmailMock.mockRejectedValue(new Error('Brevo failure'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { emailService } = await import('./email.service');

    await expect(
      emailService.sendPasswordResetEmail('user@example.com', 'https://app.example.com/reset-password?token=abc'),
    ).rejects.toThrow('Brevo failure');

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const loggedLine = errorSpy.mock.calls[0][0] as string;
    expect(loggedLine).not.toContain('user@example.com');
    expect(loggedLine).toMatch(/EMAIL_ERROR:.*us\*+@example\.com/);

    errorSpy.mockRestore();
  });
});
