import React, { useState } from 'react';

export default function Auth() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    fullName: '',
    country: '',
    email: '',
    referralCode: '',
    username: '',
    displayName: '',
    otp: ['', '', '', '', '', ''] // 6-digit OTP array
  });

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...formData.otp];
    newOtp[index] = value.substring(value.length - 1);
    setFormData({ ...formData, otp: newOtp });

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] p-4 text-white font-sans">
      <div className="w-full max-w-[390px] rounded-3xl bg-[#1E1E1E] p-6 shadow-2xl border border-neutral-800">
        
        {/* STEP 1: CREATE YOUR ACCOUNT */}
        {step === 1 && (
          <div className="flex flex-col space-y-5">
            <div className="text-center">
              <h1 className="text-xl font-bold tracking-tight">Create your Account</h1>
            </div>

            {/* Google Social Auth */}
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black transition hover:bg-neutral-200">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative flex items-center justify-center py-1">
              <div className="absolute w-full border-t border-neutral-800"></div>
              <span className="relative bg-[#1E1E1E] px-3 text-xs text-neutral-400">Sign up with email</span>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Full name" 
                  className="w-full rounded-xl bg-[#2A2A2A] p-3 text-sm text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Country</label>
                <select 
                  className="w-full rounded-xl bg-[#2A2A2A] p-3 text-sm text-neutral-400 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                >
                  <option value="">Select country</option>
                  <option value="US">United States</option>
                  <option value="NG">Nigeria</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="w-full rounded-xl bg-[#2A2A2A] p-3 text-sm text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Referral Code (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Referral Code" 
                  className="w-full rounded-xl bg-[#2A2A2A] p-3 text-sm text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                />
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full rounded-xl bg-[#0066FE] py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Next
            </button>

            <div className="text-center text-xs text-neutral-400">
              Already have an account? <span className="text-[#0066FE] cursor-pointer hover:underline">Login</span>
            </div>
          </div>
        )}

        {/* STEP 2: CREATE USERNAME */}
        {step === 2 && (
          <div className="flex flex-col space-y-5">
            <div className="text-center">
              <h1 className="text-xl font-bold tracking-tight">Create Username</h1>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Create username</label>
                <input 
                  type="text" 
                  placeholder="@username" 
                  className="w-full rounded-xl bg-[#2A2A2A] p-3 text-sm text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Create display name</label>
                <input 
                  type="text" 
                  placeholder="Display name" 
                  className="w-full rounded-xl bg-[#2A2A2A] p-3 text-sm text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </div>
            </div>

            <button 
              onClick={() => setStep(3)}
              className="w-full rounded-xl bg-[#0066FE] py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Next
            </button>

            <div className="text-center text-xs text-neutral-400">
              Already have an account? <span className="text-[#0066FE] cursor-pointer hover:underline">Login</span>
            </div>
          </div>
        )}

        {/* STEP 3: OTP VERIFICATION */}
        {step === 3 && (
          <div className="flex flex-col space-y-6 py-4">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold tracking-tight">Hello, {formData.fullName || 'James'}</h1>
              <p className="text-xs text-neutral-400 px-4">
                We sent your 6 digit code to <br />
                <span className="text-white font-medium">{formData.email || 'email@domain.com'}</span>
              </p>
            </div>

            {/* 6 Digit Input Group */}
            <div className="flex justify-between gap-2 px-2">
              {formData.otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e.key, index)}
                  className="h-12 w-10 rounded-xl bg-[#2A2A2A] text-center text-lg font-bold text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              ))}
            </div>

            <button 
              onClick={() => alert('Authentication complete!')}
              className="w-full rounded-xl bg-[#0066FE] py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Get Started
            </button>
          </div>
        )}

      </div>
    </div>
  );
}