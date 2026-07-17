import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Check, 
  ChevronDown, 
  Users, 
  AlertCircle, 
  ArrowRight,
  Globe
} from 'lucide-react';

// Steps: 1 = Create your Account, 2 = Create Username, 3 = Welcome Screen
type Step = 1 | 2 | 3;

interface FormData {
  country: string;
  fullName: string;
  username: string;
  displayName: string;
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'AU', name: 'Australia' }
];

export default function App() {
  const [step, setStep] = useState<Step>(1);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [takenUsernameError, setTakenUsernameError] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    country: '',
    fullName: 'Johnny Smith', // pre-filled placeholder matching your wireframe
    username: 'samuel_dev',
    displayName: 'Johnny Smith'
  });

  const handleSelectCountry = (countryName: string) => {
    setFormData(prev => ({ ...prev, country: countryName }));
    setShowCountryDropdown(false);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, username: value }));
    
    // Simulate your wireframe validation: "samuel_dev" is taken
    if (value.toLowerCase() === 'samuel_dev') {
      setTakenUsernameError(true);
    } else {
      setTakenUsernameError(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Device frame container replicating an iPhone 13 mini style */}
      <div className="w-[375px] h-[812px] bg-white rounded-[40px] shadow-2xl border-8 border-slate-900 overflow-hidden flex flex-col relative">
        
        {/* Status Bar Spacer */}
        <div className="h-10 w-full bg-white flex justify-between items-center px-6 pt-2 text-xs font-semibold text-slate-800">
          <span>9:41</span>
          <div className="flex gap-1.5 items-center">
            <span className="w-4 h-2.5 bg-slate-800 rounded-sm"></span>
          </div>
        </div>

        {/* Dynamic Multi-Step Screen Content */}
        <div className="flex-1 flex flex-col justify-between p-6 pb-8">
          
          {/* STEP 1: CREATE YOUR ACCOUNT */}
          {step === 1 && (
            <div className="flex-1 flex flex-col">
              <div className="text-center mt-6 mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Create your Account</h1>
              </div>

              {/* Google SSO Button */}
              <button 
                type="button" 
                onClick={handleNextStep}
                className="w-full py-3 px-4 border border-slate-200 rounded-xl flex items-center justify-center gap-3 bg-white hover:bg-slate-50 transition font-medium text-slate-700 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.16-3.16C17.45 1.68 14.93 1 12 1 7.35 1 3.39 3.68 1.41 7.6l3.79 2.94C6.1 7.35 8.8 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.46h6.45c-.28 1.48-1.11 2.73-2.36 3.58l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.52z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.2 14.54c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.41 7.02C.51 8.82 0 10.85 0 13s.51 4.18 1.41 5.98l3.79-2.94-1-.1c-.48 0-1.07.13-1.46.22z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.96 1.09-3.2 0-5.9-2.31-6.8-5.5L1.75 15.78C3.73 19.68 7.7 23 12 23z"
                  />
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200"></span>
                </div>
                <span className="relative bg-white px-3 text-xs text-slate-400 uppercase tracking-wider">
                  Sign up with email
                </span>
              </div>

              {/* Country Picker Dropdown */}
              <div className="space-y-4 flex-1">
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Country
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="w-full flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-left text-slate-800 hover:border-slate-300 transition"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" />
                      {formData.country || 'Select'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  {showCountryDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {COUNTRIES.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => handleSelectCountry(item.name)}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 transition text-sm first:rounded-t-xl last:rounded-b-xl"
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Full Name Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                      placeholder="Johnny Smith"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Action Button */}
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!formData.country || !formData.fullName}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:shadow-none"
              >
                Next
              </button>
            </div>
          )}

          {/* STEP 2: CREATE USERNAME */}
          {step === 2 && (
            <div className="flex-1 flex flex-col">
              <div className="text-center mt-6 mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Create Username</h1>
              </div>

              <div className="space-y-5 flex-1">
                {/* Username Input Field with State Validation */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Create username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={handleUsernameChange}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-3 focus:outline-none transition ${
                      takenUsernameError 
                        ? 'border-red-500 bg-red-50 text-red-900 focus:border-red-500' 
                        : 'border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white'
                    }`}
                    placeholder="username"
                  />
                  
                  {/* Figma-style Hints */}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-slate-400">
                      Format: a-z, no spaces, no special characters
                    </p>
                    {takenUsernameError && (
                      <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        This username is taken. Try another.
                      </p>
                    )}
                  </div>
                </div>

                {/* Display Name Input Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Create display name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    placeholder="Display name"
                  />
                </div>
              </div>

              {/* Bottom Action Button */}
              <button
                type="button"
                onClick={handleNextStep}
                disabled={takenUsernameError || !formData.username || !formData.displayName}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:shadow-none"
              >
                Next
              </button>
            </div>
          )}

          {/* STEP 3: WELCOME SCREEN */}
          {step === 3 && (
            <div className="flex-1 flex flex-col justify-between">
              
              {/* Profile setup card */}
              <div className="mt-10 space-y-6">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-slate-900">
                    Hello, {formData.fullName.split(' ')[0]}.
                  </h1>
                  <p className="text-slate-500 font-medium">
                    Let's find your community.
                  </p>
                </div>

                {/* Neighbors Online Graphic Card */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 py-10">
                  <div className="p-4 bg-blue-500/10 rounded-full text-blue-600">
                    <Users className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-900">147 Neighbors Online</h3>
                    <p className="text-xs text-slate-500 mt-1">active right now in your area</p>
                  </div>
                </div>
              </div>

              {/* Reset/Get Started Action */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => alert('Onboarding Completed!')}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl flex items-center justify-center gap-2 transition"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setTakenUsernameError(false);
                  }}
                  className="w-full py-2.5 text-slate-400 hover:text-slate-600 text-xs font-medium transition"
                >
                  Back to Beginning
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Home Indicator Bar Spacer (iPhone style) */}
        <div className="h-6 w-full flex justify-center items-center pb-2 bg-white">
          <div className="w-32 h-1 bg-slate-300 rounded-full"></div>
        </div>

      </div>
    </div>
  );
}