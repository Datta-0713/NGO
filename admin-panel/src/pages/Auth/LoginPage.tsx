import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '@/store';
import { loginThunk } from '@/store/slices/authSlice';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Leaf, Mail, Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) dispatch(loginThunk({ email, password }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="bg-green-50 p-4 rounded-2xl">
              <Leaf size={32} className="text-primary" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">NEXY Foundation</h1>
              <p className="text-sm text-muted mt-1">Admin Panel</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">Welcome back</h2>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
                {error}
              </div>
            )}

            <Input
              label="Email address"
              type="email"
              placeholder="admin@nexyfoundation.org"
              icon={<Mail size={16} />}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={<Lock size={16} />}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-xs text-muted text-center mt-6">
            This panel is restricted to NEXY Foundation staff only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;