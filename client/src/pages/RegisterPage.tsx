import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export const RegisterPage = () => {
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
  const { register: registerUser, isLoading } = useAuth();
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
        <h2 className="text-2xl font-bold text-center">Register</h2>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-1">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" {...register('firstName', { required: true })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register('lastName', { required: true })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" {...register('email', { required: true })} type="email" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              {...register('password', { required: true, minLength: 6 })}
              type="password"
            />
            {errors.password && (
              <p className="text-destructive text-xs mt-1">Password must be at least 6 characters.</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              {...register('confirmPassword', {
                required: true,
                validate: (value) => value === password || "Passwords don't match",
              })}
              type="password"
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
              I agree to the{' '}
              <a href="/terms" target="_blank" className="text-primary underline underline-offset-4 hover:opacity-80">
                Terms of Service
              </a>
            </Label>
          </div>
          {errors.termsAccepted && (
            <p className="text-destructive text-xs">You must accept the terms of service.</p>
          )}
          <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <p className="text-sm text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary underline underline-offset-4 hover:opacity-80">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};
