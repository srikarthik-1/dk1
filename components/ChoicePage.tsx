
import React, { useState, useEffect } from 'react';
import { InfinityIcon } from './Icons';

interface ChoicePageProps {
  onRegister: () => void;
  onLogin: () => void;
}

const AnimatedItem: React.FC<{ delay: string; children: React.ReactNode }> = ({ delay, children }) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
};

const ChoicePage: React.FC<ChoicePageProps> = ({ onRegister, onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <AnimatedItem delay="100ms">
          <InfinityIcon className="mx-auto h-12 w-12 text-black mb-5" />
        </AnimatedItem>
        <AnimatedItem delay="300ms">
          <h1 className="text-5xl md:text-6xl text-black">
            Pay<span className="italic">Loop</span>
          </h1>
        </AnimatedItem>
        <AnimatedItem delay="500ms">
          <p className="text-neutral-600 mt-2 text-lg">Administrator Access</p>
        </AnimatedItem>
        
        <AnimatedItem delay="700ms">
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5">
            <button 
              onClick={onRegister} 
              className="w-full sm:w-auto bg-transparent border border-black text-black px-8 py-3 rounded-md hover:bg-neutral-100 transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Register Admin
            </button>
            <button 
              onClick={onLogin} 
              className="w-full sm:w-auto bg-black text-white font-semibold px-8 py-3 rounded-md hover:bg-neutral-800 transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Login Admin
            </button>
          </div>
        </AnimatedItem>
      </div>
    </div>
  );
};

export default ChoicePage;
