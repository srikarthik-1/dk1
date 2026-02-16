
import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, EyeIcon, EyeOffIcon } from './Icons';

interface LoginPageProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBack, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setError('');
      onLoginSuccess();
    } else {
      setError('Credentials Invalid.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50">
      <div 
        className={`w-full max-w-sm p-8 md:p-10 border border-neutral-200 bg-white shadow-xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <button onClick={onBack} className="flex items-center gap-2 text-neutral-500 hover:text-black transition-colors mb-8 text-sm">
          <ArrowLeftIcon className="w-4 h-4" />
          Return
        </button>

        <h2 className="text-3xl text-black">Access Terminal</h2>
        <p className="text-neutral-500 mb-8">Please authenticate.</p>

        <form onSubmit={handleLogin}>
          <div className="mb-5">
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Identifier</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full bg-transparent border-b border-neutral-300 text-black py-2 focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Passcode</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-transparent border-b border-neutral-300 text-black py-2 focus:outline-none focus:border-black transition-colors pr-8"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-black"
              >
                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-black text-white font-semibold px-6 py-3 rounded-md hover:bg-neutral-800 transform hover:-translate-y-0.5 transition-all duration-300 mt-4"
          >
            Enter System
          </button>
          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        </form>

        {/* Dev Login Button */}
        <div className="text-center mt-6">
          <button onClick={onLoginSuccess} className="text-xs text-neutral-400 hover:text-black transition-colors">
            Dev Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;