import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PASSWORD_MIN_LENGTH, passwordsMatchValidator } from '@/lib/passwordValidation';

export const RegisterPage = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
  const registerUser = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();

  const password = watch('password');

  const onSubmit = handleSubmit(async (data) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = data;
    await registerUser(registerData);
    navigate('/login');
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted px-5">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">{t('register.title')}</h2>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-1">
            <Label htmlFor="firstName">{t('register.firstNameLabel')}</Label>
            <Input id="firstName" {...register('firstName', { required: true })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastName">{t('register.lastNameLabel')}</Label>
            <Input id="lastName" {...register('lastName', { required: true })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">{t('register.emailLabel')}</Label>
            <Input id="email" {...register('email', { required: true })} type="email" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">{t('register.passwordLabel')}</Label>
            <PasswordInput
              id="password"
              {...register('password', { required: true, minLength: PASSWORD_MIN_LENGTH })}
            />
            {errors.password && (
              <p className="text-destructive text-xs mt-1">{t('register.passwordTooShort', { minLength: PASSWORD_MIN_LENGTH })}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">{t('register.confirmPasswordLabel')}</Label>
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
          <div className="flex items-center gap-2">
            <Checkbox
              id="termsAccepted"
              onCheckedChange={(checked) => setValue('termsAccepted', checked, { shouldValidate: true })}
            />
            <Label htmlFor="termsAccepted" className="cursor-pointer font-normal">
              {t('register.termsAgreementPrefix')}{' '}
              <a href="/terms" target="_blank" className="text-primary underline underline-offset-4 hover:opacity-80">
                {t('register.termsOfServiceLink')}
              </a>
            </Label>
          </div>
          {errors.termsAccepted && (
            <p className="text-destructive text-xs">{t('register.mustAcceptTerms')}</p>
          )}
          <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
            {isLoading ? t('register.submitting') : t('register.submit')}
          </Button>
        </form>
        <p className="text-sm text-center">
          {t('register.haveAccount')}{' '}
          <Link to="/login" className="text-primary underline underline-offset-4 hover:opacity-80">
            {t('register.loginLink')}
          </Link>
        </p>
      </div>
    </div>
  );
};
