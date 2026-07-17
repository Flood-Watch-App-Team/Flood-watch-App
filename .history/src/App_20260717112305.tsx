import React, { useState } from 'react';
import { Mail, Lock, User, ShieldCheck, MapPin, AlertTriangle, Menu, Bell } from 'lucide-react';

// Define Step Types
type AuthStep = 'REGISTER' | 'USERNAME' | 'OTP' | 'MAP';

export default function App() {
  const [step, setStep] = useState<AuthStep>('REGISTER');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);

  // Handle OTP Input focus shift
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;
    
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value !== '' && element.nextElementSibling) {
      (element.nextElementSibling as HTMLInputElement).focus();
    }
  };

  // Submit Handlers
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) setStep('USERNAME');
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username) setStep('OTP');
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('').length === 4) setStep('MAP');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center font-sans selection:bg-teal-500 selection:text-slate-900">
      
      {/* --- AUTHENTICATION FLOW --- */}
      {step !== 'MAP' && (
        <div className="w-full max-w-md p-8 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl mx-4">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-teal-500/10 rounded-full border border-teal-500/20 text-teal-400 mb-3">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Flood-Watch</h1>
            <p className="text-slate-400 text-sm mt-1">Real-time flood alerts and monitoring</p>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-between items-center mb-8 px-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step === 'REGISTER' ? 'bg-teal-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>1</div>
            <div className="h-0.5 bg-slate-700 flex-1 mx-2"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step === 'USERNAME' ? 'bg-teal-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>2</div>
            <div className="h-0.5 bg-slate-700 flex-1 mx-2"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step === 'OTP' ? 'bg-teal-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>3</div>
          </div>

          {/* STEP 1: CREATE ACCOUNT */}
          {step === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <h2 className="text-xl font-semibold">Create Account</h2>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Mail className="w-5 h-5" /></span>
                  <input required type="email" placeholder="you@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-600" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Lock className="w-5 h-5" /></span>
                  <input required type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-600" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5">
                Continue
              </button>
            </form>
          )}

          {/* STEP 2: CREATE USERNAME */}
          {step === 'USERNAME' && (
            <form onSubmit={handleUsernameSubmit} className="space-y-5">
              <h2 className="text-xl font-semibold">Choose Username</h2>
              <p className="text-sm text-slate-400">This handle will identify you across flood reports and alerts.</p>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><User className="w-5 h-5" /></span>
                  <input required type="text" placeholder="flood_watcher12" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-600" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5">
                Next
              </button>
            </form>
          )}

          {/* STEP 3: OTP VERIFICATION */}
          {step === 'OTP' && (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <h2 className="text-xl font-semibold">Verify Email</h2>
              <p className="text-sm text-slate-400">We've sent a 4-digit code to <span className="text-teal-400 font-medium">{email || 'your email'}</span>.</p>
              <div className="flex justify-between gap-3 py-2">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onFocus={(e) => e.target.select()}
                    className="w-16 h-16 text-center text-2xl font-bold bg-slate-900 border border-slate-700 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all"
                  />
                ))}
              </div>
              <button type="submit" className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5">
                Get Started
              </button>
            </form>
          )}

        </div>
      )}

      {/* --- APP LANDING STATE (MAP VIEW) --- */}
      {step === 'MAP' && (
        <div className="w-full h-screen flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-teal-400" />
              <span className="font-bold text-lg tracking-wide text-white">Flood-Watch</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
              </button>
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 text-sm">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs uppercase">
                  {username[0] || 'U'}
                </div>
                <span className="font-medium text-slate-300">@{username || 'User'}</span>
              </div>
            </div>
          </header>

          {/* Map Viewer (Embedding MapTiler Outdoor Production Template) */}
          <div className="flex-1 relative">
            <iframe 
              src="https://cloud.maptiler.com/maps/019f66b3-a259-762d-88e7-b953a370ff5a/" 
              title="Maps / Outdoor production | MapTiler Cloud"
              className="w-full h-full border-0"
              allow="geolocation"
            />
          </div>
        </div>
      )}

    </div>
  );
}