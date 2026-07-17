import React, { useState } from 'react';
import './Auth.css'; // Importing the separate light mode CSS file

export default function Auth() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    fullName: '',
    country: '',
    email: '',
    referralCode: '',
    username: '',
    displayName: '',
    otp: ['', '', '', '', '', '']
  });

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...formData.otp];
    newOtp[index] = value.substring(value.length - 1);
    setFormData({ ...formData, otp: newOtp });

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
    <div className="auth-container">
      <div className="auth-card">
        
        {/* STEP 1: CREATE YOUR ACCOUNT */}
        {step === 1 && (
          <div className="auth-step-panel">
            <h1 className="auth-title">Create your Account</h1>

            <button className="google-btn">
              <svg viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="auth-divider">
              <span>Sign up with email</span>
            </div>

            <div className="form-group-stack">
              {/* 1. Country */}
              <div className="input-block">
                <label>Country</label>
                <div className="select-wrapper">
                  <select 
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="US">United States</option>
                    <option value="NG">Nigeria</option>
                  </select>
                </div>
              </div>

              {/* 2. Full Name */}
              <div className="input-block">
                <label>Full name</label>
                <input 
                  type="text" 
                  placeholder="Johnny Smith" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              {/* 3. Email Address */}
              <div className="input-block">
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="example@gmail.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* 4. Referral Code */}
              <div className="input-block">
                <label>Referral Code <span className="optional-text">(optional)</span></label>
                <input 
                  type="text" 
                  placeholder="KJL9ML23P" 
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                />
              </div>
            </div>

            <button onClick={() => setStep(2)} className="primary-action-btn">Next</button>

            <div className="footer-switch">
              Already have an account? <span className="link-text">Login</span>
            </div>
          </div>
        )}

        {/* STEP 2: CREATE USERNAME */}
        {step === 2 && (
          <div className="auth-step-panel">
            <h1 className="auth-title">Create Username</h1>

            <div className="form-group-stack">
              <div className="input-block">
                <label>Create username</label>
                <input 
                  type="text" 
                  placeholder="@username" 
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div className="input-block">
                <label>Create display name</label>
                <input 
                  type="text" 
                  placeholder="Display name" 
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </div>
            </div>

            <button onClick={() => setStep(3)} className="primary-action-btn">Next</button>

            <div className="footer-switch">
              Already have an account? <span className="link-text">Login</span>
            </div>
          </div>
        )}

        {/* STEP 3: OTP VERIFICATION */}
        {step === 3 && (
          <div className="auth-step-panel text-center">
            <h1 className="auth-title">Hello, {formData.fullName || 'Johnny'}</h1>
            <p className="otp-subtitle">
              We sent your 6 digit code to <br />
              <span className="user-email-highlight">{formData.email || 'example@gmail.com'}</span>
            </p>

            <div className="otp-input-row">
              {formData.otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  className="otp-box"
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
            </div>

            <button onClick={() => alert('Authenticated!')} className="primary-action-btn">Get Started</button>
          </div>
        )}

      </div>
    </div>
  );
}