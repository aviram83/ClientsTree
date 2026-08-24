import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';

export const LoginPage = () => {
  const { t } = useTranslation();
  const { register, handleSubmit } = useForm();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    await login(data);
    navigate('/dashboard');
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted px-5">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">{t('login.title')}</h2>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-1">
            <Label htmlFor="email">{t('login.emailLabel')}</Label>
            <Input id="email" {...register('email')} type="email" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">{t('login.passwordLabel')}</Label>
            <PasswordInput id="password" {...register('password')} required />
            <p className="text-sm text-right">
              <Link to="/forgot-password" className="text-primary underline underline-offset-4 hover:opacity-80">
                {t('login.forgotPassword')}
              </Link>
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('login.submitting') : t('login.submit')}
          </Button>
        </form>
        <p className="text-sm text-center">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="text-primary underline underline-offset-4 hover:opacity-80">
            {t('login.registerLink')}
          </Link>
        </p>
      </div>
    </div>
  );
};
