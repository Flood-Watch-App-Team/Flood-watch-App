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

export default function App() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  
  const [reports, setReports] = useState<FloodReport[]>(LAGOS_FLOOD_REPORTS);
  const [selectedReport, setSelectedReport] = useState<FloodReport | null>(null);
  const [isReporting, setIsReporting] = useState<boolean>(false);
  
  // NEW: Screen Mode Controller State ('form' or 'adjust')
  const [reportingStage, setReportingStage] = useState<'form' | 'adjust'>('form');
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

  // Geolocation Resolution Effect
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
    }
    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setCapturedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const lagosBounds: [ [number, number], [number, number] ] = [
      [2.6924, 6.2201],
      [4.2505, 6.7020]
    ];

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/positron/style.json?key=${MAPTILER_KEY}`,
      center: [3.4064, 6.4654], 
      zoom: 11,
      maxBounds: lagosBounds,
      minZoom: 1
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  useEffect(() => {
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
  }, [reports]);

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
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
  };

  // Quick select tag handlers from the figma mockup
  const selectQuickTag = async (tag: string) => {
    setSearchQuery(tag);
    setIsManualLocation(true);
    setNewLocationName(`${tag}, Lekki Phase 1`);
    
    // Simulating specific Lekki offsets for design lookups
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
  };

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
      
      {/* FIGMA RED PIN CENTER OVERLAY (Shows up during map adjustments) */}
      {isReporting && reportingStage === 'adjust' && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)', zIndex: 2, pointerEvents: 'none' }}>
          <div style={{ fontSize: '32px' }}>📍</div>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 3, pointerEvents: 'none', width: '100%', height: '100%' }}>
        <div className="alert-banner" style={{ pointerEvents: 'auto' }}>
          🚨 Real-Time Tracking: {reports.length} Active Flood Reports in Lagos
        </div>

        {/* BOTTOM NAVIGATION BAR PANEL */}
        <div className='navBar' style={{ pointerEvents: 'auto' }}>
          {!isReporting && !selectedReport && (
            <>
              <button className="report-trigger-btn" onClick={() => setIsReporting(false)}>
                <img src={mapIcon} alt="MapIcon" width={24} height={24} /> Maps
              </button>
              <button className="report-trigger-btn" onClick={() => alert("Navigating to feed view...")}>
                <img src={feedIcon} alt="FeedIcon" width={24} height={24} /> Feed
              </button>
              <button className="report-trigger-btn-camera" onClick={() => setIsReporting(true)}>
                <img src={cameraIcon} alt="CameraIcon" width={24} height={24} /> Report
              </button>
              <button className="report-trigger-btn" onClick={() => alert("Checking area warnings...")}>
                <img src={alertIcon} alt="AlertIcon" width={24} height={24} /> Alerts
              </button>
              <button className="report-trigger-btn" onClick={() => alert("Opening profile menu...")}>
                <img src={profileIcon} alt="ProfileIcon" width={24} height={24} /> Profile
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
                    {/* FIXED: "Adjust" button now brings user to Figma screen view B */}
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
                {/* Upper Floating Map Settings */}
                <div style={{ padding: '16px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)' }}>
                  <button className="back-btn" style={{ background: '#fff', borderRadius: '50%', padding: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} onClick={() => setReportingStage('form')}>
                    ✕
                  </button>
                </div>

                {/* Bottom Interactive Figma Slide Window */}
                <div style={{ background: '#fff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '20px', boxShadow: '0 -4px 16px rgba(0,0,0,0.1)' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, textAlign: 'center', marginBottom: '16px' }}>Adjust location</h2>
                  
                  <form onSubmit={handleManualSearchSubmit} style={{ position: 'relative', marginBottom: '16px' }}>
                    <input 
                      type="text" 
                      placeholder="Search a street or area" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '15px' }}
                    />
                  </form>

                  {/* Horizontal pill tags slider matching the exact labels in the screenshot */}
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