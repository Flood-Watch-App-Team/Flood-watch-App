import React, { useState } from 'react';

interface AuthProps {
  onAuthComplete: (username: string) => void;
}

type AuthStep = 'splash' | 'signin' | 'signup';

export default function Auth({ onAuthComplete }: AuthProps) {
  const [step, setStep] = useState<AuthStep>('splash');

  // Sign In Form States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up Form States
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // Handle Login Completion
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim()) {
      alert('Please enter your email address.');
      return;
    }
    const cleanUsername = signInEmail.split('@')[0].toLowerCase();
    onAuthComplete(cleanUsername);
  };

  // Handle Registration Completion
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !signUpEmail.trim()) {
      alert('Please fill out all required fields.');
      return;
    }
    const cleanUsername = fullName.trim().toLowerCase().replace(/\s+/g, '_');
    onAuthComplete(cleanUsername);
  };

  return (
    <div style={{
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#194c8b',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '402px', padding: '24px', boxSizing: 'border-box' }}>

        {/* ----------------- 1. SPLASH SCREEN FLOW ----------------- */}
        {step === 'splash' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%', justifyContent: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              backgroundColor: '#003366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              boxShadow: '0 10px 25px rgba(0, 51, 102, 0.2)'
            }}>
                <img src="/src/assets/Floodwatchlogo.svg" alt="" width={24} height={24}color='white'  />
        
            
            </div>
            
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
              FloodWatch
            </h1>
            <p style={{ fontSize: '15px', color: '#6B7280', marginBottom: '40px', lineHeight: '1.5' }}>
              Real-time flood detection, alert reporting & community safety mapping.
            </p>

            <button 
              onClick={() => setStep('signin')}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: '#003366',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '12px'
              }}
            >
              Get Started
            </button>

            <button 
              onClick={() => setStep('signup')}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: 'none',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* ----------------- 2. SIGN IN PAGE FLOW ----------------- */}
        {step === 'signin' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
              Sign in to view flood alerts in your area.
            </p>

            <button 
              type="button"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                fontWeight: '600',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                marginBottom: '20px'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#9CA3AF' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
              <span style={{ padding: '0 12px', fontSize: '13px' }}>or sign in with email</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
            </div>

            <form onSubmit={handleSignInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Email Address</label>
                <input 
                  type="email" 
                  placeholder="Email address" 
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Password</label>
                <input 
                  type="password" 
                  placeholder="Password" 
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', boxSizing: 'border-box' }}
                />
              </div>

              <button 
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: '#003366',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginTop: '12px'
                }}
              >
                Sign In
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280', marginTop: '24px' }}>
              Don't have an account?{' '}
              <span 
                onClick={() => setStep('signup')}
                style={{ color: '#003366', fontWeight: '600', cursor: 'pointer' }}
              >
                Sign Up
              </span>
            </p>
          </div>
        )}

        {/* ----------------- 3. CREATE ACCOUNT PAGES FLOW ----------------- */}
        {step === 'signup' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: '0 0 24px 0' }}>
              Create your Account
            </h2>

            <button 
              type="button"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                fontWeight: '600',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                marginBottom: '24px'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#9CA3AF' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
              <span style={{ padding: '0 12px', fontSize: '13px' }}>Sign up with email</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
            </div>

            <form onSubmit={handleSignUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Full Name</label>
                <input 
                  type="text" 
                  placeholder="Full name" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Country</label>
                <select 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FFF', boxSizing: 'border-box' }}
                >
                  <option value="United States">United States</option>
                  <option value="Nigeria">Nigeria</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Email Address</label>
                <input 
                  type="email" 
                  placeholder="Email address" 
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Referral Code (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Referral Code" 
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', boxSizing: 'border-box' }}
                />
              </div>

              <button 
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: '#003366',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginTop: '12px'
                }}
              >
                Next
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280', marginTop: '24px' }}>
              Already have an account?{' '}
              <span 
                onClick={() => setStep('signin')}
                style={{ color: '#003366', fontWeight: '600', cursor: 'pointer' }}
              >
                Login
              </span>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}