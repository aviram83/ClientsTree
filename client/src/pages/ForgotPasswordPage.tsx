import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as api from '../api';

export const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    try {
      const response = await api.forgotPassword(data.email);
      setMessage(response.data.message);
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted px-5">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">{t('forgotPassword.title')}</h2>
        {message ? (
          <div role="status" aria-live="polite" className="space-y-6">
            <p className="text-sm text-center">{message}</p>
            <p className="text-sm text-center">
              <Link to="/login" className="text-primary underline underline-offset-4 hover:opacity-80">
                {t('forgotPassword.backToLogin')}
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-1">
              <Label htmlFor="email">{t('login.emailLabel')}</Label>
              <Input id="email" {...register('email', { required: true })} type="email" />
              {errors.email && (
                <p className="text-destructive text-xs mt-1">{t('forgotPassword.emailRequired')}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
            </Button>
          </form>
        )}
        {!message && (
          <p className="text-sm text-center">
            {t('forgotPassword.rememberedPassword')}{' '}
            <Link to="/login" className="text-primary underline underline-offset-4 hover:opacity-80">
              {t('forgotPassword.loginLink')}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};
