import React, { useState, useEffect } from 'react';

interface AuthProps {
  onAuthComplete: (username: string) => void;
}

type AuthStep = 'splash' | 'landing' | 'signin' | 'signup';
type SignUpSubStep = 1 | 2 | 3 | 'otp';

export default function Auth({ onAuthComplete }: AuthProps) {
  const [step, setStep] = useState<AuthStep>('splash');
  const [signUpSubStep, setSignUpSubStep] = useState<SignUpSubStep>(1);

  // Sign In Form States
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up Form States
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPhoneError, setSignUpPhoneError] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // OTP Verification State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // Auto-transition from Splash to Landing Screen after 2 seconds
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => {
        setStep('landing');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [step]);

  // Real-time phone input handler for Sign In
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    if (phoneError) setPhoneError('');

    if (!val) {
      setPhoneNumber('');
      return;
    }

    const hasPlus = val.startsWith('+');
    val = val.replace(/[^0-9]/g, '');
    if (hasPlus) val = '+' + val;

    if (val.startsWith('+234')) {
      if (val.length > 14) val = val.slice(0, 14);
    } else if (val.startsWith('0')) {
      if (val.length > 11) val = val.slice(0, 11);
    } else if (val.startsWith('+')) {
      if (!'+234'.startsWith(val)) return;
    } else {
      if (val.length > 10) val = val.slice(0, 10);
    }

    setPhoneNumber(val);
  };

  // Real-time phone input handler for Sign Up
  const handleSignUpPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    if (signUpPhoneError) setSignUpPhoneError('');

    if (!val) {
      setSignUpPhone('');
      return;
    }

    const hasPlus = val.startsWith('+');
    val = val.replace(/[^0-9]/g, '');
    if (hasPlus) val = '+' + val;

    if (val.startsWith('+234')) {
      if (val.length > 14) val = val.slice(0, 14);
    } else if (val.startsWith('0')) {
      if (val.length > 11) val = val.slice(0, 11);
    } else if (val.startsWith('+')) {
      if (!'+234'.startsWith(val)) return;
    } else {
      if (val.length > 10) val = val.slice(0, 10);
    }

    setSignUpPhone(val);
  };

  // Format validation helper
  const validatePhoneNumber = (val: string) => {
    const clean = val.trim();
    const ngFormat = /^0\d{10}$/;        
    const intlFormat = /^\+234\d{10}$/;  
    return ngFormat.test(clean) || intlFormat.test(clean);
  };

  // Active status checks
  const isSignInActive = signInPassword.length >= 8;
  const isStep1Valid = signUpUsername.trim().length > 0 && signUpPhone.length >= 10;
  
  // Password criteria check
  const hasMinLength = signUpPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(signUpPassword);
  const hasNumber = /[0-9]/.test(signUpPassword);
  const isStep2Valid = hasMinLength && hasUppercase && hasNumber;

  // Mask Phone for OTP Screen
  const maskedPhone = signUpPhone ? signUpPhone.slice(0, 6) + '****' + signUpPhone.slice(-2) : '+234 80****78';

  // Handle Login Submission
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError('Please enter 10 digits after 0 or +234.');
      return;
    }
    setPhoneError('');
    const cleanUsername = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
    onAuthComplete(cleanUsername || 'user');
  };

  // Handle Step 1 Submission
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhoneNumber(signUpPhone)) {
      setSignUpPhoneError('Please enter 10 digits after 0 or +234.');
      return;
    }
    setSignUpPhoneError('');
    setSignUpSubStep(2);
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input box
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const cleanUsername = signUpUsername.trim().toLowerCase().replace(/\s+/g, '_');
    onAuthComplete(cleanUsername || 'user');
  };

  return (
    <div style={{
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#091b29',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* Dynamic Keyframe Animations */}
      <style>{`
        @keyframes eyeballWobbleLeft {
          0%, 100% { transform: translate(0px, 0px); }
          25% { transform: translate(-2px, -1.5px); }
          50% { transform: translate(2px, 1.5px); }
          75% { transform: translate(-1.5px, 2px); }
        }

        @keyframes eyeballWobbleRight {
          0%, 100% { transform: translate(0px, 0px); }
          25% { transform: translate(2px, -1.5px); }
          50% { transform: translate(-2px, 1.5px); }
          75% { transform: translate(1.5px, 2px); }
        }

        .eyeball-dot-left {
          animation: eyeballWobbleLeft 0.8s ease-in-out infinite;
        }

        .eyeball-dot-right {
          animation: eyeballWobbleRight 0.8s ease-in-out infinite;
        }
      `}</style>

      <div style={{ 
        width: '100%', 
        maxWidth: '402px', 
        height: '100%',
        maxHeight: '874px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        position: 'relative'
      }}>

        {/* Header Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          padding: '12px 24px 0 24px',
          fontSize: '14px',
          fontWeight: '600',
          color: step === 'splash' ? '#FFFFFF' : '#111827',
          backgroundColor: step === 'splash' ? '#091b29' : '#FFFFFF',
          transition: 'all 0.3s ease'
        }}>
          <span>9:41</span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor">
              <path d="M0 8h3V10H0V8zm4-3h3v5H4V5zm4-3h3v8H8V2zm4-2h3v10h-3V0z"/>
            </svg>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
              <path d="M7.5 0C3.4 0 0 2.5 0 5.5c0 1.8 1.3 3.4 3.3 4.4L2.5 11l2.8-1.5c.7.2 1.4.3 2.2.3 4.1 0 7.5-2.5 7.5-5.5S11.6 0 7.5 0z"/>
            </svg>
          </div>
        </div>

        {/* ----------------- 1. SPLASH SCREEN ----------------- */}
        {step === 'splash' && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flex: 1,
            backgroundColor: '#091b29'
          }}>
            <div style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#FFFFFF',
                WebkitMaskImage: `url(/src/assets/Floodwatchlogo.svg)`,
                maskImage: `url(/src/assets/Floodwatchlogo.svg)`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
              }} />

              <div className="eyeball-dot-left" style={{
                position: 'absolute',
                top: '44%',
                left: '35%',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#091b29',
                pointerEvents: 'none'
              }} />

              <div className="eyeball-dot-right" style={{
                position: 'absolute',
                top: '44%',
                right: '35%',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#091b29',
                pointerEvents: 'none'
              }} />
            </div>

            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>
              Flood-watch
            </h1>
          </div>
        )}

        {/* ----------------- 2. LANDING PAGE ----------------- */}
        {step === 'landing' && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center', 
            backgroundColor: '#FFFFFF',
            padding: '32px 24px',
            flex: 1,
            justifyContent: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#091b29',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#FFFFFF',
                WebkitMaskImage: `url(/src/assets/Floodwatchlogo.svg)`,
                maskImage: `url(/src/assets/Floodwatchlogo.svg)`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
              }} />
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 12px 0' }}>
              Welcome to FloodWatch
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '36px', lineHeight: '1.5' }}>
              Stay ahead of urban flooding. Receive live community alerts and report road conditions instantly.
            </p>

            <button 
              onClick={() => setStep('signin')}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '28px',
                backgroundColor: '#091b29',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                marginBottom: '12px'
              }}
            >
              Sign In
            </button>

            <button 
              onClick={() => {
                setStep('signup');
                setSignUpSubStep(1);
              }}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '28px',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: 'none',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* ----------------- 3. SIGN IN SCREEN ----------------- */}
        {step === 'signin' && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            flex: 1, 
            padding: '32px 28px',
            backgroundColor: '#FFFFFF',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '24px', marginTop: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#091b29',
                  WebkitMaskImage: `url(/src/assets/Floodwatchlogo.svg)`,
                  maskImage: `url(/src/assets/Floodwatchlogo.svg)`,
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                }} />
              </div>

              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#111827', 
                textAlign: 'left', 
                marginBottom: '28px',
                letterSpacing: '-0.2px'
              }}>
                Welcome back!
              </h1>

              <form onSubmit={handleSignInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '8px', fontWeight: '500' }}>
                    Phone number
                  </label>
                  <input 
                    type="tel" 
                    value={phoneNumber}
                    onChange={handlePhoneInputChange}
                    placeholder="+234 801 234 5678" 
                    required
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      borderRadius: '12px', 
                      border: phoneError ? '1px solid #EF4444' : '1px solid #E5E7EB', 
                      backgroundColor: '#FAFAFA',
                      fontSize: '15px',
                      color: '#111827',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {phoneError && (
                    <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '6px', display: 'block' }}>
                      {phoneError}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '8px', fontWeight: '500' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Enter your password" 
                      required
                      style={{ 
                        width: '100%', 
                        padding: '14px 44px 14px 16px', 
                        borderRadius: '12px', 
                        border: '1px solid #E5E7EB', 
                        backgroundColor: '#FAFAFA',
                        fontSize: '15px',
                        color: '#111827',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9CA3AF',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: 'right', marginTop: '-4px' }}>
                  <a href="#forgot" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', fontWeight: '500' }}>
                    Forgot password?
                  </a>
                </div>

                <button 
                  type="submit"
                  disabled={!isSignInActive}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '28px',
                    backgroundColor: isSignInActive ? '#091b29' : '#6C8395',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: isSignInActive ? 'pointer' : 'not-allowed',
                    marginTop: '24px',
                    transition: 'background-color 0.25s ease, cursor 0.25s ease'
                  }}
                >
                  Sign in
                </button>
              </form>
            </div>

            <p style={{ textAlign: 'center', fontSize: '13px', color: '#6B7280', margin: '24px 0 12px 0' }}>
              Don't have an account?{' '}
              <span 
                onClick={() => {
                  setStep('signup');
                  setSignUpSubStep(1);
                }}
                style={{ color: '#111827', fontWeight: '700', cursor: 'pointer' }}
              >
                Create Account
              </span>
            </p>
          </div>
        )}

        {/* ----------------- 4. PROGRESSIVE CREATE ACCOUNT FLOW (FIGMA EXACT MATCH) ----------------- */}
        {step === 'signup' && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            flex: 1, 
            padding: '16px 24px 24px 24px',
            backgroundColor: '#FFFFFF',
            justifyContent: 'space-between',
            overflowY: 'auto'
          }}>
            <div>
              {/* Top Navigation & Step Indicator Header */}
              {signUpSubStep !== 'otp' && (
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (signUpSubStep === 1) setStep('landing');
                        else if (signUpSubStep === 2) setSignUpSubStep(1);
                        else if (signUpSubStep === 3) setSignUpSubStep(2);
                      }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#F3F4F6',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#374151'
                      }}
                    >
                      ‹
                    </button>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                      Create your Account
                    </h2>
                  </div>

                  {/* Progress Bar & Text Counter */}
                  
                </div>
              )}

              {/* ---------------- STEP 1 (1 of 3): Personal Information ---------------- */}
              {signUpSubStep === 1 && (
                <div>
                  {/* Icon Avatar */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#091b29',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF'
                    }}>
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
                      Personal Information
                    </h3>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                      Let's start with your basic details
                    </p>
                  </div>

                    <div style={{ display: 'grid', alignItems: 'center', margin: '10px 0 20px 0', gap: '12px' }}>
                    <div style={{ flex: 1, height: '8px', backgroundColor: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        backgroundColor: '#091b29', 
                        width: signUpSubStep === 1 ? '33.3%' : signUpSubStep === 2 ? '66.6%' : '100%',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', minWidth: '32px', textAlign: 'right' }}>
                      {signUpSubStep} of 3
                    </span>
                  </div>

                  <form onSubmit={handleStep1Next} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '8px', fontWeight: '500' }}>
                        Username
                      </label>
                      <input 
                        type="text" 
                        placeholder="Enter your username" 
                        required
                        value={signUpUsername}
                        onChange={(e) => setSignUpUsername(e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '14px 16px', 
                          borderRadius: '12px', 
                          border: '1px solid #E5E7EB', 
                          backgroundColor: '#FFFFFF', 
                          fontSize: '14px',
                          color: '#111827',
                          outline: 'none',
                          boxSizing: 'border-box' 
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '8px', fontWeight: '500' }}>
                        Phone number
                      </label>
                      <input 
                        type="tel" 
                        placeholder="+234 801 234 5678" 
                        required
                        value={signUpPhone}
                        onChange={handleSignUpPhoneChange}
                        style={{ 
                          width: '100%', 
                          padding: '14px 16px', 
                          borderRadius: '12px', 
                          border: signUpPhoneError ? '1px solid #EF4444' : '1px solid #E5E7EB', 
                          backgroundColor: '#FFFFFF', 
                          fontSize: '14px',
                          color: '#111827',
                          outline: 'none',
                          boxSizing: 'border-box' 
                        }}
                      />
                      <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px', display: 'block' }}>
                        Used to log in and receive OTP codes
                      </span>
                      {signUpPhoneError && (
                        <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                          {signUpPhoneError}
                        </span>
                      )}
                    </div>

                    <button 
                      type="submit"
                      disabled={!isStep1Valid}
                      style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '28px',
                        backgroundColor: isStep1Valid ? '#091b29' : '#6C8395',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '15px',
                        cursor: isStep1Valid ? 'pointer' : 'not-allowed',
                        marginTop: '24px',
                        transition: 'background-color 0.25s ease'
                      }}
                    >
                      Continue
                    </button>
                  </form>
                </div>
              )}

              {/* ---------------- STEP 2 (2 of 3): Secure Your Account ---------------- */}
              {signUpSubStep === 2 && (
                <div>
                  {/* Lock Icon */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#091b29',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF'
                    }}>
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
                      Secure Your Account
                    </h3>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                      Create a strong password to protect your account
                    </p>
                  </div>

                    <div style={{ display: 'grid', alignItems: 'center', margin: '16px 0 20px 0', gap: '12px' }}>
                    <div style={{ flex: 1, height: '8px', backgroundColor: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        backgroundColor: '#091b29', 
                        width: signUpSubStep === 2 ? '66.6%' : signUpSubStep === 2 ? '66.6%' : '100%',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', minWidth: '32px', textAlign: 'right' }}>
                      {signUpSubStep} of 3
                    </span>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); setSignUpSubStep(3); }} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '8px', fontWeight: '500' }}>
                        Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type={showSignUpPassword ? 'text' : 'password'} 
                          placeholder="••••••••••••" 
                          required
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          style={{ 
                            width: '100%', 
                            padding: '14px 44px 14px 16px', 
                            borderRadius: '12px', 
                            border: '1px solid #E5E7EB', 
                            backgroundColor: '#FFFFFF', 
                            fontSize: '14px',
                            color: '#111827',
                            outline: 'none',
                            boxSizing: 'border-box' 
                          }}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                          style={{
                            position: 'absolute',
                            right: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#9CA3AF',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Password Requirements Card */}
                    <div style={{
                      backgroundColor: '#F3F4F6',
                      borderRadius: '12px',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>ⓘ Password Requirements</span>
                      </div>
                      <div style={{ fontSize: '12px', color: hasMinLength ? '#10B981' : '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        • At least 8 characters
                      </div>
                      <div style={{ fontSize: '12px', color: hasUppercase ? '#10B981' : '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        • One Uppercase letter
                      </div>
                      <div style={{ fontSize: '12px', color: hasNumber ? '#10B981' : '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        • One number
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={!isStep2Valid}
                      style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '28px',
                        backgroundColor: isStep2Valid ? '#091b29' : '#6C8395',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '15px',
                        cursor: isStep2Valid ? 'pointer' : 'not-allowed',
                        marginTop: '16px',
                        transition: 'background-color 0.25s ease'
                      }}
                    >
                      Continue
                    </button>
                  </form>
                </div>
              )}

              {/* ---------------- STEP 3 (3 of 3): Almost Done! ---------------- */}
              {signUpSubStep === 3 && (
                <div>
                  {/* Check Icon */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#091b29',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF'
                    }}>
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
                      Almost Done!
                    </h3>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                      Review and Confirm
                    </p>
                  </div>

                    <div style={{ display: 'grid', alignItems: 'center', margin: '16px 0 20px 0', gap: '12px' }}>
                    <div style={{ flex: 1, height: '8px', backgroundColor: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        backgroundColor: '#091b29', 
                        width: signUpSubStep === 3 ? '100%' : signUpSubStep === 3 ? '100%' : '100%',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', minWidth: '32px', textAlign: 'right' }}>
                      {signUpSubStep} of 3
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    {/* Username Review */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '12px', backgroundColor: '#FAFAFA' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#091b29', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#6B7280' }}>Username</div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>@{signUpUsername || 'username'}</div>
                        </div>
                      </div>
                      <button onClick={() => setSignUpSubStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>✎</button>
                    </div>

                    {/* Phone Review */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '12px', backgroundColor: '#FAFAFA' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#091b29', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#6B7280' }}>Phone number</div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{signUpPhone || '+234 801 234 5678'}</div>
                        </div>
                      </div>
                      <button onClick={() => setSignUpSubStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>✎</button>
                    </div>

                    {/* Password Review */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '12px', backgroundColor: '#FAFAFA' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#091b29', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#6B7280' }}>Password</div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>••••••••</div>
                        </div>
                      </div>
                      <button onClick={() => setSignUpSubStep(2)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>✎</button>
                    </div>
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: '#6B7280', cursor: 'pointer', marginBottom: '24px' }}>
                    <input 
                      type="checkbox" 
                      checked={agreedToTerms} 
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      style={{ marginTop: '2px', accentColor: '#091b29' }} 
                    />
                    <span>
                      By creating an account, you agree to our <a href="#terms" style={{ color: '#091b29', textDecoration: 'underline' }}>Terms of service</a> and <a href="#privacy" style={{ color: '#091b29', textDecoration: 'underline' }}>privacy policy</a>
                    </span>
                  </label>

                  <button 
                    type="button"
                    disabled={!agreedToTerms}
                    onClick={() => setSignUpSubStep('otp')}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '28px',
                      backgroundColor: agreedToTerms ? '#091b29' : '#6C8395',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '15px',
                      cursor: agreedToTerms ? 'pointer' : 'not-allowed',
                      transition: 'background-color 0.25s ease'
                    }}
                  >
                    Create account
                  </button>
                </div>
              )}

              {/* ---------------- STEP 4 (3 of 3): OTP VERIFICATION ---------------- */}
              {signUpSubStep === 'otp' && (
                <div style={{ paddingTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setSignUpSubStep(3)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#F3F4F6',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#374151',
                      marginBottom: '20px'
                    }}
                  >
                    ‹
                  </button>

                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
                      Hello, {signUpUsername || 'User'}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: '1.4' }}>
                      We sent you a verification code to<br />
                      <span style={{ fontWeight: '600', color: '#374151' }}>{maskedPhone}</span>
                    </p>
                  </div>

                  {/* 6 Digit Input Boxes */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        style={{
                          width: '44px',
                          height: '52px',
                          borderRadius: '12px',
                          border: '1px solid #E5E7EB',
                          backgroundColor: '#FFFFFF',
                          textAlign: 'center',
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#111827',
                          outline: 'none'
                        }}
                      />
                    ))}
                  </div>

                  <div style={{ textAlign: 'center', fontSize: '12px', color: '#6B7280', marginBottom: '32px' }}>
                    OTP expires in <span style={{ fontWeight: '600', color: '#374151' }}>00:48</span>
                  </div>

                  <button 
                    type="button"
                    onClick={handleVerifyOtp}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '28px',
                      backgroundColor: otp.every(d => d !== '') ? '#091b29' : '#6C8395',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '15px',
                      cursor: 'pointer',
                      marginBottom: '20px',
                      transition: 'background-color 0.25s ease'
                    }}
                  >
                    Verify Code
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '13px', color: '#6B7280', margin: 0 }}>
                    Didn't receive OTP?{' '}
                    <span style={{ color: '#091b29', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>
                      Resend code
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Footer Sign-In Switch */}
            {signUpSubStep !== 'otp' && (
              <p style={{ textAlign: 'center', fontSize: '13px', color: '#6B7280', margin: '20px 0 8px 0' }}>
                Already have an account?{' '}
                <span 
                  onClick={() => setStep('signin')}
                  style={{ color: '#091b29', fontWeight: '700', cursor: 'pointer' }}
                >
                  Log in
                </span>
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}