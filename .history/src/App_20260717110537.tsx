import { useEffect, useRef, useState } from 'react';

// 1. Import maplibre-gl
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import type { FloodReport } from './type';

import cameraIcon from "./assets/camera-01.svg";
import mapIcon from "./assets/maps.svg";
import feedIcon from "./assets/menu-03 copy.svg";
import alertIcon from "./assets/notification-02.svg";
import profileIcon from "./assets/user.svg";

// Lucide icons for the new Figma onboarding states
import { 
  User, 
  ChevronDown, 
  Users, 
  AlertCircle, 
  Globe
} from 'lucide-react';

// 2. MapTiler Access Key
const MAPTILER_KEY = 'sdtBMUsCK9bQkLIjtyQX';

const LAGOS_FLOOD_REPORTS: FloodReport[] = [
  {
    id: 1,
    locationName: "Lekki Phase 1",
    coordinates: [3.4841, 6.4281],
    imageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=400",
    waterLevel: "High",
    status: "Verified"
  }
];

type TabType = 'maps' | 'feed' | 'report' | 'alerts' | 'profile';

// Onboarding steps match the Figma design flow
type OnboardingStep = 1 | 2 | 3;

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'AU', name: 'Australia' }
];

export default function App() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  
  const [reports, setReports] = useState<FloodReport[]>(LAGOS_FLOOD_REPORTS);
  const [selectedReport, setSelectedReport] = useState<FloodReport | null>(null);
  const [isReporting, setIsReporting] = useState<boolean>(false);
  
  // Navigation & Screen Control States
  const [currentTab, setCurrentTab] = useState<TabType>('maps');
  const [reportingStage, setReportingStage] = useState<'form' | 'adjust'>('form');
  
  // --- HIGH FIDELITY FIGMA AUTHENTICATION STATES ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(1);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [takenUsernameError, setTakenUsernameError] = useState(false);
  
  const [authForm, setAuthForm] = useState({
    country: '',
    fullName: 'Johnny Smith', // Pre-filled placeholder matching figma
    username: 'samuel_dev',
    displayName: 'Johnny Smith'
  });

  // Search states for the main top searchable bar
  const [mainSearchQuery, setMainSearchQuery] = useState('');
  const [displayedLocation, setDisplayedLocation] = useState('Locating your position...');

  // Search state for the adjust location screen
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newLocationName, setNewLocationName] = useState('Fetching live location...');
  const [currentCoords, setCurrentCoords] = useState<[number, number] | null>(null);
  const [isManualLocation, setIsManualLocation] = useState<boolean>(false);
  
  const [newWaterLevel, setNewWaterLevel] = useState<'Low' | 'Medium' | 'High'>('High');
  const [description, setDescription] = useState('');
  
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  // AUTOMATIC GEOLOCATION: Find and display current location on initial app load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { longitude, latitude } = position.coords;
          setCurrentCoords([longitude, latitude]);
          
          if (mapRef.current) {
            mapRef.current.flyTo({ center: [longitude, latitude], zoom: 14, essential: true });
          }

          try {
            const response = await fetch(
              `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${MAPTILER_KEY}`
            );
            const data = await response.json();

            if (data.features && data.features.length > 0) {
              const placeName = data.features[0].place_name;
              setDisplayedLocation(placeName);
              setNewLocationName(placeName);
            } else {
              const simpleCoords = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              setDisplayedLocation(simpleCoords);
              setNewLocationName(simpleCoords);
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error);
            setDisplayedLocation("Lagos, Nigeria");
          }
        },
        (error) => {
          console.error("Geolocation failed:", error);
          setDisplayedLocation("Lagos, Nigeria");
          setCurrentCoords([3.4064, 6.4654]); // Default to central Lagos
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setDisplayedLocation("Lagos, Nigeria");
      setCurrentCoords([3.4064, 6.4654]);
    }
  }, []);

  // Geolocation resolution loop for workflow reports
  useEffect(() => {
    if (!isReporting) return;
    if (isManualLocation) return;

    if (navigator.geolocation) {
      setNewLocationName('Locating your position...');
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { longitude, latitude } = position.coords;
          setCurrentCoords([longitude, latitude]);

          try {
            const response = await fetch(
              `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${MAPTILER_KEY}`
            );
            const data = await response.json();

            if (data.features && data.features.length > 0) {
              setNewLocationName(data.features[0].place_name);
            } else {
              setNewLocationName(`Lagos Point (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error);
            setNewLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        },
        (error) => {
          console.error("Error capturing browser geolocation:", error);
          setNewLocationName('Your live location cannot be found');
          setCurrentCoords([3.4064, 6.4654]);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setNewLocationName('Your live location cannot be found');
    }
  }, [isReporting, isManualLocation]);

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (capturedImages.length >= 2) {
        alert("Maximum limit reached. You can only attach up to 2 photos per report.");
        return;
      }
      const file = files[0];
      const localImageUrl = URL.createObjectURL(file);
      setCapturedImages(prev => [...prev, localImageUrl]);
      setIsReporting(true); 
      setCurrentTab('report');
    }
    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setCapturedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Initialize Map only when authenticated and container is present
  useEffect(() => {
    if (!isAuthenticated || !mapContainerRef.current) return;

    const lagosBounds: [ [number, number], [number, number] ] = [
      [2.6924, 6.2201],
      [4.2505, 6.7020]
    ];

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/019f66b3-a259-762d-88e7-b953a370ff5a/style.json?key=${MAPTILER_KEY}`,
      center: [3.4064, 6.4654], 
      zoom: 11,
      maxBounds: lagosBounds,
      minZoom: 1
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!mapRef.current || !isAuthenticated) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    reports.forEach((report) => {
      const markerEl = document.createElement('div');
      markerEl.className = 'photo-marker';
      markerEl.style.backgroundImage = `url(${report.imageUrl})`;

      markerEl.addEventListener('click', () => {
        setSelectedReport(report);
      });

      const newMarker = new maplibregl.Marker({ element: markerEl })
        .setLngLat(report.coordinates)
        .addTo(mapRef.current!);

      markersRef.current.push(newMarker);
    });
  }, [reports, isAuthenticated]);

  // Dynamic Initial Extractor for high-fidelity profile avatar
  const getUserInitials = (): string => {
    const baseName = authForm.username.trim() || authForm.fullName.trim();
    if (!baseName) return 'U';

    const parts = baseName.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return baseName.substring(0, 2).toUpperCase();
  };

  // Handle Country Selection
  const handleSelectCountry = (countryName: string) => {
    setAuthForm(prev => ({ ...prev, country: countryName }));
    setShowCountryDropdown(false);
  };

  // Handle Username changes with state validation warning limits
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAuthForm(prev => ({ ...prev, username: value }));
    
    if (value.toLowerCase() === 'samuel_dev') {
      setTakenUsernameError(true);
    } else {
      setTakenUsernameError(false);
    }
  };

  // Maps Tab re-centering logic
  const handleMapsTabClick = () => {
    setCurrentTab('maps');
    setIsReporting(false);
    
    const centerPoint: [number, number] = currentCoords || [3.4064, 6.4654];
    mapRef.current?.flyTo({
      center: centerPoint,
      zoom: 14,
      essential: true
    });
  };

  // Top search bar query handler
  const handleMainSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainSearchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(mainSearchQuery)}.json?key=${MAPTILER_KEY}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        setDisplayedLocation(feature.place_name);
        mapRef.current?.flyTo({ center: feature.center, zoom: 14, essential: true });
        setMainSearchQuery('');
      } else {
        setDisplayedLocation(mainSearchQuery);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
  };

  // Adjust location screen search handler
  const handleManualSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${MAPTILER_KEY}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        setNewLocationName(feature.place_name);
        setCurrentCoords(feature.center);
        setIsManualLocation(true);
        mapRef.current?.flyTo({ center: feature.center, zoom: 15 });
      } else {
        setNewLocationName(searchQuery);
        setIsManualLocation(true);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
      setNewLocationName(searchQuery);
      setIsManualLocation(true);
    }
  };

  const selectQuickTag = async (tag: string) => {
    setSearchQuery(tag);
    setIsManualLocation(true);
    setNewLocationName(`${tag}, Lekki Phase 1`);
    
    const positions: Record<string, [number, number]> = {
      'Admiralty Way': [3.4841, 6.4281],
      'Chevron Drive': [3.5358, 6.4430],
      'Freedom Way': [3.4920, 6.4350]
    };
    
    if (positions[tag]) {
      setCurrentCoords(positions[tag]);
      mapRef.current?.flyTo({ center: positions[tag], zoom: 15 });
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const targetCoordinates: [number, number] = currentCoords || [3.4064, 6.4654];

    const newReport: FloodReport = {
      id: Date.now(),
      locationName: newLocationName,
      coordinates: targetCoordinates,
      imageUrl: capturedImages[0] || "https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=400",
      waterLevel: newWaterLevel,
      status: "Verified"
    };

    setReports(prev => [...prev, newReport]);
    mapRef.current?.flyTo({ center: targetCoordinates, zoom: 15, essential: true });

    setIsSubmitting(false);
    setDescription('');
    setCapturedImages([]); 
    setIsReporting(false);
    setIsManualLocation(false);
    setReportingStage('form');
    setSearchQuery('');
    setNewLocationName('Fetching live location...');
    setCurrentTab('maps');
  };

  // --- RENDERING FIGMA ONBOARDING / SIGNUP STATES ---
  if (!isAuthenticated) {
    return (
      <div 
        style={{ 
          width: '100vw', 
          height: '100vh', 
          backgroundColor: '#F8FAFC', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '16px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{
          width: '375px',
          height: '812px',
          backgroundColor: '#FFFFFF',
          borderRadius: '40px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '8px solid #0F172A',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxSizing: 'border-box'
        }}>
          {/* iOS Status Bar Spacer */}
          <div style={{ height: '40px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', boxSizing: 'border-box', fontSize: '12px', fontWeight: 600, color: '#1E293B' }}>
            <span>9:41</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ width: '16px', height: '10px', backgroundColor: '#1E293B', borderRadius: '2px' }}></span>
            </div>
          </div>

          {/* Dynamic Onboarding Stages */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', boxSizing: 'border-box' }}>
            
            {/* FIGMA STEP 1: CREATE YOUR ACCOUNT */}
            {onboardingStep === 1 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '32px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Create your Account</h1>
                </div>

                {/* Google Sign In Button */}
                <button 
                  type="button" 
                  onClick={() => setOnboardingStep(2)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#334155',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.16-3.16C17.45 1.68 14.93 1 12 1 7.35 1 3.39 3.68 1.41 7.6l3.79 2.94C6.1 7.35 8.8 5.04 12 5.04z" />
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.46h6.45c-.28 1.48-1.11 2.73-2.36 3.58l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.52z" />
                    <path fill="#FBBC05" d="M5.2 14.54c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.41 7.02C.51 8.82 0 10.85 0 13s.51 4.18 1.41 5.98l3.79-2.94-1-.1c-.48 0-1.07.13-1.46.22z" />
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.96 1.09-3.2 0-5.9-2.31-6.8-5.5L1.75 15.78C3.73 19.68 7.7 23 12 23z" />
                  </svg>
                  Continue with Google
                </button>

                {/* Divider */}
                <div style={{ position: 'relative', margin: '24px 0', textAlign: 'center' }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: '100%', borderTop: '1px solid #E2E8F0' }}></span>
                  </div>
                  <span style={{ relative: 'absolute', backgroundColor: '#FFFFFF', padding: '0 12px', fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Sign up with email
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, position: 'relative' }}>
                  {/* Country Field Dropdown Selector */}
                  <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      Country
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontSize: '15px',
                        color: '#1E293B',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Globe style={{ width: '16px', height: '16px', color: '#94A3B8' }} />
                        {authForm.country || 'Select'}
                      </span>
                      <ChevronDown style={{ width: '16px', height: '16px', color: '#64748B' }} />
                    </button>

                    {showCountryDropdown && (
                      <div style={{
                        position: 'absolute',
                        zIndex: 20,
                        marginTop: '4px',
                        width: '100%',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        maxHeight: '192px',
                        overflowY: 'auto'
                      }}>
                        {COUNTRIES.map((item) => (
                          <button
                            key={item.code}
                            type="button"
                            onClick={() => handleSelectCountry(item.name)}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '10px 16px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              fontSize: '14px',
                              color: '#334155'
                            }}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Full Name Input Field */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      Full Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User style={{ position: 'absolute', left: '16px', top: '14px', width: '16px', height: '16px', color: '#94A3B8' }} />
                      <input
                        type="text"
                        value={authForm.fullName}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, fullName: e.target.value }))}
                        style={{
                          width: '100%',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          padding: '12px 16px 12px 44px',
                          fontSize: '15px',
                          color: '#1E293B',
                          boxSizing: 'border-box',
                          outline: 'none'
                        }}
                        placeholder="Johnny Smith"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOnboardingStep(2)}
                  disabled={!authForm.country || !authForm.fullName}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                    opacity: (!authForm.country || !authForm.fullName) ? 0.5 : 1
                  }}
                >
                  Next
                </button>
              </div>
            )}

            {/* FIGMA STEP 2: CREATE USERNAME */}
            {onboardingStep === 2 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '32px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Create Username</h1>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      Create username
                    </label>
                    <input
                      type="text"
                      value={authForm.username}
                      onChange={handleUsernameChange}
                      style={{
                        width: '100%',
                        backgroundColor: takenUsernameError ? '#FEF2F2' : '#F8FAFC',
                        border: takenUsernameError ? '1px solid #EF4444' : '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontSize: '15px',
                        color: takenUsernameError ? '#991B1B' : '#1E293B',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                      placeholder="username"
                    />
                    
                    <div style={{ marginTop: '8px' }}>
                      <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                        Format: a-z, no spaces, no special characters
                      </p>
                      {takenUsernameError && (
                        <p style={{ fontSize: '12px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 0 0', fontWeight: 500 }}>
                          <AlertCircle style={{ width: '14px', height: '14px' }} />
                          This username is taken. Try another.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      Create display name
                    </label>
                    <input
                      type="text"
                      value={authForm.displayName}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, displayName: e.target.value }))}
                      style={{
                        width: '100%',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontSize: '15px',
                        color: '#1E293B',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                      placeholder="Display name"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOnboardingStep(3)}
                  disabled={takenUsernameError || !authForm.username || !authForm.displayName}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                    opacity: (takenUsernameError || !authForm.username || !authForm.displayName) ? 0.5 : 1
                  }}
                >
                  Next
                </button>
              </div>
            )}

            {/* FIGMA STEP 3: WELCOME SCREEN */}
            {onboardingStep === 3 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Hello, {authForm.fullName.split(' ')[0]}.
                    </h1>
                    <p style={{ fontSize: '16px', color: '#64748B', fontWeight: 500, margin: 0 }}>
                      Let's find your community.
                    </p>
                  </div>

                  {/* Neighbors Online card layout from Figma */}
                  <div style={{
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #DBEAFE',
                    borderRadius: '24px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    paddingTop: '40px',
                    paddingBottom: '40px'
                  }}>
                    <div style={{ padding: '16px', backgroundColor: 'rgba(37, 99, 235, 0.1)', borderRadius: '9999px', color: '#2563EB' }}>
                      <Users style={{ width: '32px', height: '32px' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>147 Neighbors Online</h3>
                      <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', margin: 0 }}>active right now in your area</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsAuthenticated(true);
                    setCurrentTab('maps');
                  }}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  Get Started
                  <ArrowRight style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            )}

          </div>

          {/* iOS Bottom Home Indicator Spacer */}
          <div style={{ height: '24px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', p: '8px', backgroundColor: '#FFFFFF' }}>
            <div style={{ width: '128px', height: '5px', backgroundColor: '#CBD5E1', borderRadius: '9999px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER MAIN APPLICATION IF AUTHENTICATED ---
  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef}
        style={{ display: 'none' }} 
        onChange={handleCameraCapture}
      />

      <div ref={mapContainerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />
      
      {/* FIGMA HIGH-FIDELITY LOCATION POINTER OVERLAY */}
      {isReporting && reportingStage === 'adjust' && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -100%)', 
            zIndex: 2, 
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div 
            style={{
              transform: 'translateY(-4px)',
              animation: 'pinBounce 2s ease-in-out infinite alternate',
            }}
          >
            <svg 
              width="40" 
              height="48" 
              viewBox="0 0 40 48" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.15))' }}
            >
              <path 
                d="M20 0C8.954 0 0 8.954 0 20C0 32.5 20 48 20 48C20 48 40 32.5 40 20C40 8.954 31.046 0 20 0Z" 
                fill="#E11D48" 
              />
              <circle cx="20" cy="18" r="7" fill="white" />
              <circle cx="20" cy="18" r="3.5" fill="#E11D48" />
            </svg>
          </div>

          <div 
            style={{
              width: '12px',
              height: '4px',
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '50%',
              marginTop: '-2px',
              animation: 'shadowScale 2s ease-in-out infinite alternate'
            }}
          />

          <style>{`
            @keyframes pinBounce {
              0% { transform: translateY(-4px); }
              100% { transform: translateY(-10px); }
            }
            @keyframes shadowScale {
              0% { transform: scale(1); opacity: 0.8; }
              100% { transform: scale(0.6); opacity: 0.4; }
            }
          `}</style>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 3, pointerEvents: 'none', width: '100%', height: '100%' }}>
        
        {/* FIGMA FLOATING TOP HEADER SEARCH BAR */}
        <div 
          style={{ 
            pointerEvents: 'auto',
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10
          }}
        >
          {/* EXACT FIGMA GO BACK BUTTON */}
          <button 
            onClick={() => {
              if (reportingStage === 'adjust') {
                setReportingStage('form');
              } else {
                setIsReporting(false);
                setCurrentTab('maps');
              }
            }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
              cursor: 'pointer'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* ACTIVE SEARCHABLE FIGMA INPUT FIELD */}
          <form 
            onSubmit={handleMainSearchSubmit}
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              margin: '0 12px',
              height: '44px',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
              padding: '0 16px',
              position: 'relative'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}>
              <span style={{ fontSize: '10px', color: '#9CA3AF', lineHeight: '1', marginBottom: '2px' }}>Current area</span>
              <input 
                type="text" 
                placeholder={displayedLocation} 
                value={mainSearchQuery}
                onChange={(e) => setMainSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1F2937',
                  lineHeight: '1',
                  padding: 0,
                  width: '100%',
                  backgroundColor: 'transparent'
                }}
              />
            </div>
          </form>

          {/* EXACT FIGMA CLOUD ICON BUTTON */}
          <button 
            onClick={() => alert("Cloud Sync / Weather Status Triggered")}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
              cursor: 'pointer'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5 19C18.9556 19 20.3056 18.232 21.0333 17C22.1889 15.056 21.8444 12.56 20.1556 11.024C19.8667 8.192 17.5111 6 14.6222 6C13.9111 6 13.2222 6.136 12.5778 6.4C11.5333 4.312 9.4 3 7 3C3.68889 3 1 5.688 1 9C1 9.176 1.00889 9.352 1.02667 9.528C0.404444 10.352 0.0777778 11.336 0.0777778 12.384C0.0777778 14.936 2.14222 17 4.69333 17H17.5" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* BOTTOM NAVIGATION BAR PANEL WITH ACTIVE INDICATOR DOTS */}
        <div className='navBar' style={{ pointerEvents: 'auto' }}>
          {!isReporting && !selectedReport && (
            <>
              {/* MAPS BUTTON */}
              <button 
                className={`report-trigger-btn ${currentTab === 'maps' ? 'active' : ''}`}
                onClick={handleMapsTabClick}
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <img src={mapIcon} alt="MapIcon" width={24} height={24} />
                
                {/* Active indicator dot placed between icon and label */}
                {currentTab === 'maps' && (
                  <span style={{
                    width: '5px',
                    height: '5px',
                    backgroundColor: '#E11D48',
                    borderRadius: '50%',
                    margin: '3px 0'
                  }} />
                )}
                {currentTab !== 'maps' && <div style={{ height: '11px' }} />}
                
                Maps
              </button>

              {/* FEED BUTTON */}
              <button 
                className={`report-trigger-btn ${currentTab === 'feed' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTab('feed');
                  alert("Navigating to feed view...");
                }}
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <img src={feedIcon} alt="FeedIcon" width={24} height={24} />
                
                {currentTab === 'feed' && (
                  <span style={{
                    width: '5px',
                    height: '5px',
                    backgroundColor: '#E11D48',
                    borderRadius: '50%',
                    margin: '3px 0'
                  }} />
                )}
                {currentTab !== 'feed' && <div style={{ height: '11px' }} />}
                
                Feed
              </button>

              {/* REPORT TRIGGER ACTION BUTTON */}
              <button 
                className={`report-trigger-btn-camera ${currentTab === 'report' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTab('report');
                  setIsReporting(true);
                }}
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <img src={cameraIcon} alt="CameraIcon" width={24} height={24} />
                
                {currentTab === 'report' && (
                  <span style={{
                    width: '5px',
                    height: '5px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '50%',
                    margin: '3px 0'
                  }} />
                )}
                {currentTab !== 'report' && <div style={{ height: '11px' }} />}
                
                Report
              </button>

              {/* ALERTS BUTTON */}
              <button 
                className={`report-trigger-btn ${currentTab === 'alerts' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTab('alerts');
                  alert("Checking area warnings...");
                }}
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <img src={alertIcon} alt="AlertIcon" width={24} height={24} />
                
                {currentTab === 'alerts' && (
                  <span style={{
                    width: '5px',
                    height: '5px',
                    backgroundColor: '#E11D48',
                    borderRadius: '50%',
                    margin: '3px 0'
                  }} />
                )}
                {currentTab !== 'alerts' && <div style={{ height: '11px' }} />}
                
                Alerts
              </button>

              {/* PROFILE BUTTON WITH ACTIVE INITIALS */}
              <button 
                className={`report-trigger-btn ${currentTab === 'profile' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTab('profile');
                  alert(`User Settings Profile: ${authForm.username}`);
                }}
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#003366',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 700,
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  {getUserInitials()}
                </div>
                
                {currentTab === 'profile' && (
                  <span style={{
                    width: '5px',
                    height: '5px',
                    backgroundColor: '#E11D48',
                    borderRadius: '50%',
                    margin: '3px 0'
                  }} />
                )}
                {currentTab !== 'profile' && <div style={{ height: '11px' }} />}
                
                Profile
              </button>
            </>
          )}
        </div>

        {/* SELECTED POPUP REPORT WINDOW */}
        {selectedReport && (
          <div className="slide-up-panel" style={{ pointerEvents: 'auto' }}>
            <div className="panel-header">
              <h3>{selectedReport.locationName}</h3>
              <button className="close-btn" onClick={() => setSelectedReport(null)}>✕</button>
            </div>
            <div className="panel-body">
              <span className={`badge ${selectedReport.waterLevel.toLowerCase()}`}>
                Level: {selectedReport.waterLevel}
              </span>
              <p style={{ marginTop: '12px' }}>Status: <strong>{selectedReport.status}</strong></p>
              <img src={selectedReport.imageUrl} alt="Preview" className="preview-img" />
            </div>
          </div>
        )}

        {/* WORKFLOW CONDITIONAL LAYOUT SCREENS */}
        {isReporting && (
          <>
            {/* SCREEN A: REPORTING FORM CONTAINER */}
            {reportingStage === 'form' && (
              <div className="report-container-panel" style={{ pointerEvents: 'auto' }}>
                <header className="report-header">
                  <button type="button" className="back-btn" onClick={() => {
                    setIsReporting(false);
                    setCapturedImages([]);
                    setNewLocationName('Fetching live location...');
                    setCurrentTab('maps');
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <h1>Report flooding</h1>
                  <p className="subtitle">Takes about 15 seconds</p>
                </header>

                <form onSubmit={handleReportSubmit}>
                  <section className="form-section">
                    <label className="section-label">Photos <span className="counter">({capturedImages.length}/2)</span></label>
                    <div className="photo-grid">
                      {capturedImages.map((imgUrl, idx) => (
                        <div key={idx} className="photo-preview">
                          <img src={imgUrl} alt="Flood evidence" />
                          <button type="button" className="remove-photo-btn" onClick={() => handleRemoveImage(idx)}>&times;</button>
                        </div>
                      ))}
                      {capturedImages.length < 2 && (
                        <button type="button" className="add-photo-placeholder-btn" onClick={() => fileInputRef.current?.click()}>
                          <span className="plus">+</span>
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </section>

                  <section className="form-section">
                    <label className="section-label">How bad is it?</label>
                    <div className="severity-selector">
                      {(['Low', 'Medium', 'High'] as const).map((level) => (
                        <label key={level} className={`severity-option ${level.toLowerCase()} ${newWaterLevel === level ? 'active' : ''}`}>
                          <input type="radio" name="severity" value={level} checked={newWaterLevel === level} onChange={() => setNewWaterLevel(level)} />
                          <span className="dot"></span> {level}
                        </label>
                      ))}
                    </div>
                  </section>

                  <section className="form-section">
                    <label className="section-label">Description <span className="optional">(optional)</span></label>
                    <textarea 
                      className="form-input description-box" 
                      placeholder="e.g. Water is knee-deep, cars are turning back."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </section>

                  <section className="form-section">
                    <label className="section-label">Location</label>
                    <div className="location-box">
                      <div className="location-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                      <div className="location-details">
                        <input type="text" className="location-inline-input" value={newLocationName} readOnly />
                        <p className="meta">{isManualLocation ? 'Entered manually' : 'Captured automatically'}</p>
                      </div>
                    </div>
                    <button type="button" className="adjust-location-btn" onClick={() => setReportingStage('adjust')}>
                      Not your location? <strong>Adjust</strong>
                    </button>
                  </section>

                  <footer className="form-footer">
                    <button type="submit" className="submit-btn" disabled={newLocationName === 'Locating your position...'}>Continue</button>
                  </footer>
                </form>
              </div>
            )}

            {/* SCREEN B: FIGMA "ADJUST LOCATION" OVERLAY INTERFACE */}
            {reportingStage === 'adjust' && (
              <div className="adjust-location-panel" style={{ pointerEvents: 'auto', position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
                <div style={{ padding: '16px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)' }}>
                  <button className="back-btn" style={{ background: '#fff', borderRadius: '50%', padding: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} onClick={() => setReportingStage('form')}>
                    ✕
                  </button>
                </div>

                <div style={{ background: '#fff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '20px', boxShadow: '0 -4px 16px rgba(0,0,0,0.1)' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, textAlign: 'center', marginBottom: '16px' }}>Adjust location</h2>
                  
                  <form onSubmit={handleManualSearchSubmit} style={{ position: 'relative', marginBottom: '16px' }}>
                    <input 
                      type="text" 
                      placeholder="Search a street or area" 
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setNewLocationName(e.target.value); 
                        setIsManualLocation(true);
                      }}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '15px' }}
                    />
                  </form>

                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', whiteSpace: 'nowrap' }}>
                    {['Admiralty Way', 'Chevron Drive', 'Freedom Way'].map((tag) => (
                      <button 
                        key={tag} 
                        type="button" 
                        onClick={() => selectQuickTag(tag)}
                        style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #E5E7EB', backgroundColor: searchQuery === tag ? '#003366' : '#F3F4F6', color: searchQuery === tag ? '#fff' : '#000', fontSize: '13px', fontWeight: 500 }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '16px', marginBottom: '20px' }}>
                    <p style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{newLocationName || 'Selected Location'}</p>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0 0' }}>Pin location</p>
                  </div>

                  <button 
                    type="button" 
                    className="submit-btn" 
                    onClick={() => setReportingStage('form')}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#003366', color: '#fff', border: 'none', fontWeight: 600, fontSize: '16px' }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}