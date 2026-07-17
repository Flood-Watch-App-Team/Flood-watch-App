import React, { useState, useRef } from 'react';
import { Mail, Lock, User, ShieldCheck, AlertTriangle } from 'lucide-react';

export type AuthStepType = 'REGISTER' | 'USERNAME' | 'OTP';

interface AuthProps {
  onAuthComplete: (username: string) => void;
}

export default function Auth({ onAuthComplete }: AuthProps) {
  const [authStep, setAuthStep] = useState<AuthStepType>('REGISTER');
  
  // Input fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);

  // Refs for OTP input fields to auto-focus next boxes
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Handles moving to next input when a number is typed, and backspace behavior
  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // If typing a digit, focus the next field
    if (value !== '' && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // If pressing backspace on empty field, focus previous field
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) setAuthStep('USERNAME');
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) setAuthStep('OTP');
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalOtp = otp.join('');
    if (finalOtp.length === 4) {
      // Pass the username to parent App component to unlock map
      onAuthComplete(username);
    } else {
      alert('Please enter the full 4-digit code.');
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center font-sans z-[9999]">
      <div className="w-full max-w-md p-8 bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl mx-4">
        
        {/* Header Logo & Subtext */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-teal-500/10 rounded-full border border-teal-500/20 text-teal-400 mb-3">
            <AlertTriangle className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Flood-Watch</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time flood alerts and monitoring</p>
        </div>

        {/* Step Navigation Progress Dots */}
        <div className="flex justify-between items-center mb-8 px-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${authStep === 'REGISTER' ? 'bg-rose-500 text-white scale-110 shadow-lg' : 'bg-slate-700 text-slate-400'}`}>1</div>
          <div className="h-0.5 bg-slate-700 flex-1 mx-2"></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${authStep === 'USERNAME' ? 'bg-rose-500 text-white scale-110 shadow-lg' : 'bg-slate-700 text-slate-400'}`}>2</div>
          <div className="h-0.5 bg-slate-700 flex-1 mx-2"></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${authStep === 'OTP' ? 'bg-rose-500 text-white scale-110 shadow-lg' : 'bg-slate-700 text-slate-400'}`}>3</div>
        </div>

        {/* PAGE 1: CREATE ACCOUNT */}
        {authStep === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">Create Account</h2>
              <p className="text-sm text-slate-400">Join the safety network of Lagos</p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Mail className="w-5 h-5" /></span>
                <input required type="email" placeholder="you@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-rose-500 focus:outline-none transition-all placeholder:text-slate-600 text-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Lock className="w-5 h-5" /></span>
                <input required type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-rose-500 focus:outline-none transition-all placeholder:text-slate-600 text-white" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5">
              Continue
            </button>
          </form>
        )}

        {/* PAGE 2: CREATE USERNAME */}
        {authStep === 'USERNAME' && (
          <form onSubmit={handleUsernameSubmit} className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">Claim Username</h2>
              <p className="text-sm text-slate-400">Choose an alias for reporting flooding</p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><User className="w-5 h-5" /></span>
                <input required type="text" placeholder="flood_watch_surfer" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-rose-500 focus:outline-none transition-all placeholder:text-slate-600 text-white" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5">
              Generate Verification Code
            </button>
          </form>
        )}

        {/* PAGE 3: OTP VERIFICATION */}
        {authStep === 'OTP' && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">Verify Email</h2>
              <p className="text-sm text-slate-400">We sent a 4-digit OTP to <span className="text-rose-400 font-medium">{email}</span></p>
            </div>
            <div className="flex justify-center gap-3 py-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  ref={otpRefs[index]}
                  type="text"
                  maxLength={1}
                  value={data}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onFocus={(e) => e.target.select()}
                  className="w-14 h-14 text-center text-2xl font-bold bg-slate-900 border border-slate-700 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition-all text-white"
                />
              ))}
            </div>
            <button type="submit" className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5">
              Get Started
            </button>
          </form>
        )}

      </div>
    </div>
  );
}