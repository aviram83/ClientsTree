import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-5">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Register</h2>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="label">First Name</label>
            <input {...register('firstName', { required: true })} className="input input-bordered w-full" />
          </div>
          <div>
            <label className="label">Last Name</label>
            <input {...register('lastName', { required: true })} className="input input-bordered w-full" />
          </div>
          <div>
            <label className="label">Email</label>
            <input {...register('email', { required: true })} type="email" className="input input-bordered w-full" />
          </div>
          <div>
            <label className="label">Password</label>
            <input {...register('password', { required: true, minLength: 6 })} type="password" className="input input-bordered w-full" />
            {errors.password && <p className="text-red-500 text-xs mt-1">Password must be at least 6 characters.</p>}
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input 
              {...register('confirmPassword', { 
                required: true,
                validate: value => value === password || "Passwords don't match"
              })} 
              type="password" 
              className="input input-bordered w-full" 
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{typeof errors.confirmPassword.message === 'string' && errors.confirmPassword.message}</p>}
          </div>
          <div>
            <label className="flex items-center">
              <input 
                {...register('termsAccepted', { required: true })} 
                type="checkbox" 
                className="checkbox" 
              />
              <span className="ml-2">I agree to the <a href="/terms" target="_blank" className="link">Terms of Service</a></span>
            </label>
            {errors.termsAccepted && <p className="text-red-500 text-xs mt-1">You must accept the terms of service.</p>}
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={!isValid || isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-sm text-center">
          Already have an account? <Link to="/login" className="link">Login</Link>
        </p>
      </div>
    </div>
  );
};
