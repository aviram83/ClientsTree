import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { PASSWORD_MIN_LENGTH, passwordsMatchValidator } from '@/lib/passwordValidation';
import * as api from '../api';

export const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const password = watch('password');

  const onSubmit = handleSubmit(async (data) => {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await api.resetPassword(token, data.password);
      navigate('/login');
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || t('resetPassword.genericInvalid'));
    } finally {
      setIsLoading(false);
    }
  });

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted px-5">
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center">{t('resetPassword.title')}</h2>
          <div role="status" aria-live="polite">
            <p className="text-destructive text-sm text-center">{t('resetPassword.genericInvalid')}</p>
          </div>
          <p className="text-sm text-center">
            <Link to="/forgot-password" className="text-primary underline underline-offset-4 hover:opacity-80">
              {t('resetPassword.requestNewLink')}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted px-5">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">{t('resetPassword.title')}</h2>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-1">
            <Label htmlFor="password">{t('resetPassword.newPasswordLabel')}</Label>
            <PasswordInput
              id="password"
              {...register('password', { required: true, minLength: PASSWORD_MIN_LENGTH })}
            />
            {errors.password && (
              <p className="text-destructive text-xs mt-1">{t('resetPassword.passwordTooShort', { minLength: PASSWORD_MIN_LENGTH })}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">{t('resetPassword.confirmPasswordLabel')}</Label>
            <PasswordInput
              id="confirmPassword"
              {...register('confirmPassword', {
                required: true,
                validate: (value) => passwordsMatchValidator(value, password),
              })}
            />
            {errors.confirmPassword && (
              <p className="text-destructive text-xs mt-1">
                {typeof errors.confirmPassword.message === 'string' && errors.confirmPassword.message}
              </p>
            )}
          </div>
          {errorMessage && (
            <div role="status" aria-live="polite">
              <p className="text-destructive text-sm text-center">{errorMessage}</p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
            {isLoading ? t('resetPassword.submitting') : t('resetPassword.submit')}
          </Button>
        </form>
        <p className="text-sm text-center">
          <Link to="/login" className="text-primary underline underline-offset-4 hover:opacity-80">
            {t('resetPassword.backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
};
