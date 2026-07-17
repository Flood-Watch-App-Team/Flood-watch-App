import React, { useState, useRef } from 'react';

export type AuthStepType = 'REGISTER' | 'USERNAME' | 'OTP';

interface AuthProps {
  onAuthComplete: (username: string) => void;
}

export default function Auth({ onAuthComplete }: AuthProps) {
  const [authStep, setAuthStep] = useState<AuthStepType>('REGISTER');
  
  // State variables for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);

  // Focus-shifting references for OTP inputs
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input when a digit is entered
    if (value !== '' && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Auto-focus previous input on backspace if current is empty
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
      onAuthComplete(username);
    } else {
      alert('Please fill out all 4 OTP fields.');
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen bg-[#003366] text-white flex flex-col items-center justify-center font-sans z-[9999] px-4">
      <div className="w-full max-w-md p-8 bg-white text-slate-800 rounded-2xl shadow-2xl">
        
        {/* Header Indicator */}
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-extrabold text-[#003366] tracking-tight">Flood-Watch</h1>
          <p className="text-slate-500 text-xs mt-1">Lagos Flood Warning & Community Hub</p>
        </div>

        {/* High-Fidelity Step Progression Dots */}
        <div className="flex justify-between items-center mb-8 px-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${authStep === 'REGISTER' ? 'bg-[#003366] text-white scale-110' : 'bg-slate-200 text-slate-500'}`}>1</div>
          <div className="h-[2px] bg-slate-200 flex-1 mx-2"></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${authStep === 'USERNAME' ? 'bg-[#003366] text-white scale-110' : 'bg-slate-200 text-slate-500'}`}>2</div>
          <div className="h-[2px] bg-slate-200 flex-1 mx-2"></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${authStep === 'OTP' ? 'bg-[#003366] text-white scale-110' : 'bg-slate-200 text-slate-500'}`}>3</div>
        </div>

        {/* STEP 1: CREATE ACCOUNT */}
        {authStep === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Create Account</h2>
              <p className="text-sm text-slate-500">Sign up to monitor water levels in Lagos</p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Email Address</label>
              <input required type="email" placeholder="you@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#003366] focus:outline-none transition-all placeholder:text-slate-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Password</label>
              <input required type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#003366] focus:outline-none transition-all placeholder:text-slate-400" />
            </div>
            <button type="submit" className="w-full py-3 bg-[#003366] hover:bg-[#002244] text-white font-bold rounded-xl shadow-md transition-all">
              Continue
            </button>
          </form>
        )}

        {/* STEP 2: CREATE USERNAME */}
        {authStep === 'USERNAME' && (
          <form onSubmit={handleUsernameSubmit} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Claim Username</h2>
              <p className="text-sm text-slate-500">Pick an alias. This will display on your flood reports.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 font-bold">@</span>
                <input required type="text" placeholder="lagos_watcher" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#003366] focus:outline-none transition-all placeholder:text-slate-400" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-[#003366] hover:bg-[#002244] text-white font-bold rounded-xl shadow-md transition-all">
              Send Verification Code
            </button>
          </form>
        )}

        {/* STEP 3: OTP VERIFICATION */}
        {authStep === 'OTP' && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Verify Email</h2>
              <p className="text-sm text-slate-500">We've sent a 4-digit security code to <span className="text-[#003366] font-semibold">{email}</span></p>
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
                  className="w-14 h-14 text-center text-2xl font-extrabold bg-slate-50 border border-slate-200 rounded-xl focus:border-[#003366] focus:ring-1 focus:ring-[#003366] focus:outline-none transition-all"
                />
              ))}
            </div>
            <button type="submit" className="w-full py-3 bg-[#E11D48] hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all">
              Get Started
            </button>
          </form>
        )}

      </div>
    </div>
  );
}