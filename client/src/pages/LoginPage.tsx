import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const { register, handleSubmit } = useForm();
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    await login(data);
    navigate('/dashboard');
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-5">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="label">Email</label>
            <input {...register('email')} type="email" required className="input input-bordered w-full" />
          </div>
          <div>
            <label className="label">Password</label>
            <input {...register('password')} type="password" required className="input input-bordered w-full" />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-sm text-center">
          Don't have an account? <Link to="/register" className="link">Register</Link>
        </p>
      </div>
    </div>
  );
};
