import { useEffect, useRef, useState } from 'react';

// 1. Import maplibre-gl
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// 2. Import your Auth Screen Flow
import Auth from './Auth';

import type { FloodReport } from './type';

import cameraIcon from "./assets/camera-01.svg";
import mapIcon from "./assets/maps.svg";
import feedIcon from "./assets/menu-03 copy.svg";
import alertIcon from "./assets/notification-02.svg";

// 3. MapTiler Access Key
const MAPTILER_KEY = https://api.maptiler.com/maps/019f66b3-a259-762d-88e7-b953a370ff5a/style.json?key=sdtBMUsCK9bQkLIjtyQX';

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

export default function App() {
  // --- AUTHENTICATION STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string>('');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  
  const [reports, setReports] = useState<FloodReport[]>(LAGOS_FLOOD_REPORTS);
  const [selectedReport, setSelectedReport] = useState<FloodReport | null>(null);
  const [isReporting, setIsReporting] = useState<boolean>(false);
  
  // Active Navigation Tab State
  const [currentTab, setCurrentTab] = useState<TabType>('maps');
  
  // Screen Mode Controller State ('form' or 'adjust')
  const [reportingStage, setReportingStage] = useState<'form' | 'adjust'>('form');
  
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

  // Callback to handle successful validation completion
  const handleAuthComplete = (username: string) => {
    setCurrentUser(username || 'User');
    setIsAuthenticated(true);
    setCurrentTab('maps');
  };

  // Logout Handler Function
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    setCurrentTab('maps');
    setIsReporting(false);
  };

  // Generate dynamic initials for profile indicator
  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name.trim().slice(0, 2).toUpperCase();
  };

  // 1. AUTOMATIC GEOLOCATION: Only runs if the user is fully logged in
  useEffect(() => {
    if (!isAuthenticated) return;

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
  }, [isAuthenticated]);

  // Geolocation resolution loop for workflow reports
  useEffect(() => {
    if (!isAuthenticated) return;
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
  }, [isReporting, isManualLocation, isAuthenticated]);

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

  // MAP CONTAINER INITIALIZATION FIXED Lifecycle Trigger
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // Guard against multi-initialization canvas duplication bugs

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

    // Force map size canvas rendering recalculation immediately on instance setup
    mapRef.current.on('load', () => {
      mapRef.current?.resize();
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!mapRef.current) return;

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

  // Handle Maps tab click - instantly centers the map regardless of where it's at
  const handleMapsTabClick = () => {
    setCurrentTab('maps');
    setIsReporting(false);
    
    // Fly to current coords if resolved, otherwise fall back to central Lagos
    const centerPoint: [number, number] = currentCoords || [3.4064, 6.4654];
    mapRef.current?.flyTo({
      center: centerPoint,
      zoom: 14,
      essential: true
    });
  };

  // Search interface trigger
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

  // Handle Search Input in Adjust Screen
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

  // Quick select tag handlers from the figma mockup
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

  // --- RENDER AUTH FIRST ---
  if (!isAuthenticated) {
    return <Auth onAuthComplete={handleAuthComplete} />;
  }

  // --- SUBSEQUENT MAIN APP RENDER ---
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

      {/* FIX: Set wrapper boundary explicitly using viewport constraints */}
      <div 
        ref={mapContainerRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          zIndex: 1 
        }} 
      />
      
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

          {/* QUICK INITIALS ICON CHIP */}
          <button 
            onClick={() => setCurrentTab('profile')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#003366',
              color: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            {getUserInitials(currentUser)}
          </button>
        </div>

        {/* INTERACTIVE PROFILE OVERLAY DRAWER PANEL */}
        {currentTab === 'profile' && !isReporting && (
          <div className="slide-up-panel" style={{ pointerEvents: 'auto', bottom: '80px', maxHeight: '75vh', overflowY: 'auto' }}>
            <div className="panel-header" style={{ paddingBottom: '12px', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#003366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                  {getUserInitials(currentUser)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>@{currentUser}</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>Verified Flood Watcher</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setCurrentTab('maps')}>✕</button>
            </div>
            
            <div className="panel-body" style={{ padding: '16px 0' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profile Details</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Username</label>
                  <input type="text" readOnly value={`@${currentUser}`} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#4B5563' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Account Status</label>
                  <input type="text" readOnly value="Active Citizen Reporter" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#4B5563' }} />
                </div>
              </div>

              <button 
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Log Out
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION BAR PANEL */}
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
                {currentTab === 'maps' && (
                  <span style={{ width: '5px', height: '5px', backgroundColor: '#E11D48', borderRadius: '50%', margin: '3px 0' }} />
                )}
                Maps
              </button>

              {/* FEED BUTTON */}
              <button 
                className={`report-trigger-btn ${currentTab === 'feed' ? 'active' : ''}`}
                onClick={() => setCurrentTab('feed')}
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <img src={feedIcon} alt="FeedIcon" width={24} height={24} />
                {currentTab === 'feed' && (
                  <span style={{ width: '5px', height: '5px', backgroundColor: '#E11D48', borderRadius: '50%', margin: '3px 0' }} />
                )}
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
                  <span style={{ width: '5px', height: '5px', backgroundColor: '#FFFFFF', borderRadius: '50%', margin: '3px 0' }} />
                )}
                Report
              </button>

              {/* ALERTS BUTTON */}
              <button 
                className={`report-trigger-btn ${currentTab === 'alerts' ? 'active' : ''}`}
                onClick={() => setCurrentTab('alerts')}
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <img src={alertIcon} alt="AlertIcon" width={24} height={24} />
                {currentTab === 'alerts' && (
                  <span style={{ width: '5px', height: '5px', backgroundColor: '#E11D48', borderRadius: '50%', margin: '3px 0' }} />
                )}
                Alerts
              </button>

              {/* PROFILE BUTTON */}
              <button 
                className={`report-trigger-btn ${currentTab === 'profile' ? 'active' : ''}`}
                onClick={() => setCurrentTab('profile')}
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <div 
                  style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    backgroundColor: currentTab === 'profile' ? '#003366' : '#9CA3AF', 
                    color: '#FFFFFF', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '10px', 
                    fontWeight: 'bold',
                    marginBottom: '2px'
                  }}
                >
                  {getUserInitials(currentUser)}
                </div>
                {currentTab === 'profile' && (
                  <span style={{ width: '5px', height: '5px', backgroundColor: '#E11D48', borderRadius: '50%', margin: '3px 0' }} />
                )}
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