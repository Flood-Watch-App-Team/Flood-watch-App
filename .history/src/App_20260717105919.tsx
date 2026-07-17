import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  ChevronDown, 
  Users, 
  AlertCircle, 
  ArrowRight,
  Globe,
  MapPin,
  Layers,
  Search,
  Navigation,
  LogOut
} from 'lucide-react';

// Steps: 1 = Account Info, 2 = Username/Handle, 3 = Welcome Card, 'MAP' = Leaflet Dashboard
type AppState = 1 | 2 | 3 | 'MAP';

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
  const [appState, setAppState] = useState<AppState>(1);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [takenUsernameError, setTakenUsernameError] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    country: '',
    fullName: 'Johnny Smith', 
    username: 'samuel_dev',
    displayName: 'Johnny Smith'
  });

  // Map state hooks
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [activeFloodReports, setActiveFloodReports] = useState([
    { id: 1, lat: 6.5244, lng: 3.3792, severity: 'High', description: 'Major drain overflow on Herbert Macaulay Way' },
    { id: 2, lat: 6.4281, lng: 3.4219, severity: 'Moderate', description: 'Street flooding near Lekki Phase 1 entrance' }
  ]);

  const handleSelectCountry = (countryName: string) => {
    setFormData(prev => ({ ...prev, country: countryName }));
    setShowCountryDropdown(false);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, username: value }));
    
    // Simulate "username taken" warning state
    if (value.toLowerCase() === 'samuel_dev') {
      setTakenUsernameError(true);
    } else {
      setTakenUsernameError(false);
    }
  };

  const handleNextStep = () => {
    if (appState === 1) {
      setAppState(2);
    } else if (appState === 2) {
      setAppState(3);
    }
  };

  // Lazy-load Leaflet on entering the MAP state
  useEffect(() => {
    if (appState !== 'MAP' || !mapContainerRef.current) return;

    let mapInstance: any;

    const initializeMap = async () => {
      // @ts-ignore
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      // Initialize Map centering around Lagos as a default reference
      mapInstance = L.map(mapContainerRef.current!).setView([6.5244, 3.3792], 12);

      // Using outdoor production vector tiles / style via MapTiler
      L.tileLayer('https://api.maptiler.com/maps/outdoor-v2/{z}/{x}/{y}.png?key=sdtBMUsCK9bQkLIjtyQX', {
        attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapInstance);

      // Add markers for flood reports
      activeFloodReports.forEach(report => {
        const markerColor = report.severity === 'High' ? '#ef4444' : '#f59e0b';
        
        // Custom circle markers matching the clean Map layout
        const marker = L.circleMarker([report.lat, report.lng], {
          radius: 10,
          fillColor: markerColor,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(mapInstance);

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px;">
            <strong style="color: ${markerColor};">${report.severity} Alert</strong>
            <p style="margin: 4px 0 0; color: #374151;">${report.description}</p>
          </div>
        `);
      });
    };

    initializeMap();

    // Clean up map instance when switching away or unmounting
    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [appState]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Device frame container replicating an iPhone 13 mini style */}
      <div className="w-[375px] h-[812px] bg-white rounded-[40px] shadow-2xl border-8 border-slate-900 overflow-hidden flex flex-col relative">
        
        {/* Status Bar Spacer */}
        <div className="h-10 w-full bg-white flex justify-between items-center px-6 pt-2 text-xs font-semibold text-slate-800 z-10">
          <span>9:41</span>
          <div className="flex gap-1.5 items-center">
            <span className="w-4 h-2.5 bg-slate-800 rounded-sm"></span>
          </div>
        </div>

        {/* Dynamic State Navigation */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          
          {/* STEP 1: CREATE YOUR ACCOUNT */}
          {appState === 1 && (
            <div className="flex-1 flex flex-col justify-between p-6 pb-8">
              <div className="flex-1 flex flex-col">
                <div className="text-center mt-6 mb-8">
                  <h1 className="text-2xl font-bold text-slate-900">Create your Account</h1>
                </div>

                {/* Google SSO Button */}
                <button 
                  type="button" 
                  onClick={() => setAppState(2)}
                  className="w-full py-3 px-4 border border-slate-200 rounded-xl flex items-center justify-center gap-3 bg-white hover:bg-slate-50 transition font-medium text-slate-700 shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.16-3.16C17.45 1.68 14.93 1 12 1 7.35 1 3.39 3.68 1.41 7.6l3.79 2.94C6.1 7.35 8.8 5.04 12 5.04z" />
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.46h6.45c-.28 1.48-1.11 2.73-2.36 3.58l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.52z" />
                    <path fill="#FBBC05" d="M5.2 14.54c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.41 7.02C.51 8.82 0 10.85 0 13s.51 4.18 1.41 5.98l3.79-2.94-1-.1c-.48 0-1.07.13-1.46.22z" />
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.96 1.09-3.2 0-5.9-2.31-6.8-5.5L1.75 15.78C3.73 19.68 7.7 23 12 23z" />
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

                {/* Fields */}
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
                      <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
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
              </div>

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
          {appState === 2 && (
            <div className="flex-1 flex flex-col justify-between p-6 pb-8">
              <div className="flex-1 flex flex-col">
                <div className="text-center mt-6 mb-8">
                  <h1 className="text-2xl font-bold text-slate-900">Create Username</h1>
                </div>

                <div className="space-y-5 flex-1">
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
              </div>

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
          {appState === 3 && (
            <div className="flex-1 flex flex-col justify-between p-6 pb-8">
              <div className="mt-10 space-y-6">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-slate-900">
                    Hello, {formData.fullName.split(' ')[0]}.
                  </h1>
                  <p className="text-slate-500 font-medium">
                    Let's find your community.
                  </p>
                </div>

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

              <button
                type="button"
                onClick={() => setAppState('MAP')}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl flex items-center justify-center gap-2 transition"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STATE: FULL INTERACTIVE MAP */}
          {appState === 'MAP' && (
            <div className="flex-1 flex flex-col relative h-full w-full">
              
              {/* Map Layer Container */}
              <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full" />

              {/* Floating Map UI Overlay (Top Search Bar) */}
              <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
                <div className="flex-1 bg-white rounded-full shadow-lg border border-slate-100 flex items-center px-4 py-2.5 gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search locations..." 
                    className="w-full bg-transparent border-none outline-none text-sm text-slate-700"
                  />
                </div>
                <button 
                  onClick={() => setAppState(1)}
                  className="bg-white p-3 rounded-full shadow-lg border border-slate-100 text-slate-600 hover:text-red-500 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Navigation HUD */}
              <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-100 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Active Flood Watch</h4>
                    <p className="text-xs text-emerald-500 flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      Monitoring live blockages
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                      <Layers className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition">
                      <Navigation className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex gap-2">
                  <button className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-xs transition">
                    ⚠️ Report Blockage
                  </button>
                  <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition">
                    Check Safe Routes
                  </button>
                </div>
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