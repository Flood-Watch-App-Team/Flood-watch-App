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
  
  // States adjusted to support Figma schema specifications
  const [newLocationName, setNewLocationName] = useState('Admiralty Way, Lekki Phase 1');
  const [newWaterLevel, setNewWaterLevel] = useState<'Low' | 'Medium' | 'High'>('High');
  const [description, setDescription] = useState('');
  
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

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

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationName.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const gUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(newLocationName)}.json?key=${MAPTILER_KEY}&bbox=2.6924,6.2201,4.2505,6.7020&proximity=3.4064,6.4654`;
      const response = await fetch(gUrl);
      const data = await response.json();

      let targetCoordinates: [number, number] = [3.4064, 6.4654];

      if (data.features && data.features.length > 0) {
        targetCoordinates = data.features[0].geometry.coordinates as [number, number];
      }

      const newReport: FloodReport = {
        id: Date.now(),
        locationName: newLocationName,
        coordinates: targetCoordinates,
        imageUrl: capturedImages[0] || "https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=400",
        waterLevel: newWaterLevel,
        status: "Verified"
      };

      setReports(prev => [...prev, newReport]);
      mapRef.current?.flyTo({ center: targetCoordinates, zoom: 14, essential: true });

    } catch (error) {
      console.error("Geocoding lookup error:", error);
    } finally {
      setIsSubmitting(false);
      setNewLocationName('Admiralty Way, Lekki Phase 1');
      setDescription('');
      setCapturedImages([]); 
      setIsReporting(false);
    }
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
      
      <div style={{ position: 'relative', zIndex: 2, pointerEvents: 'none', width: '100%', height: '100%' }}>
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
              <button 
                className="report-trigger-btn-camera" 
                onClick={() => {
                  if (capturedImages.length >= 2) {
                    setIsReporting(true);
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
              >
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

        {/* FIGMA PIXEL-PERFECT REPORT SUBMIT PANEL */}
        {isReporting && (
          <div className="report-container-panel" style={{ pointerEvents: 'auto' }}>
            <header className="report-header">
              <button type="button" className="back-btn" onClick={() => {
                setIsReporting(false);
                setCapturedImages([]);
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <h1>Report flooding</h1>
              <p className="subtitle">Takes about 15 seconds</p>
            </header>

            <form onSubmit={handleReportSubmit}>
              {/* Photos Grid Container */}
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

              {/* Severity Segmented Control Switch */}
              <section className="form-section">
                <label className="section-label">How bad is it?</label>
                <div className="severity-selector">
                  {(['Low', 'Medium', 'High'] as const).map((level) => (
                    <label key={level} className={`severity-option ${level.toLowerCase()} ${newWaterLevel === level ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="severity" 
                        value={level} 
                        checked={newWaterLevel === level} 
                        onChange={() => setNewWaterLevel(level)} 
                      />
                      <span className="dot"></span> {level}
                    </label>
                  ))}
                </div>
              </section>

              {/* Optional Textarea Field */}
              <section className="form-section">
                <label className="section-label">Description <span className="optional">(optional)</span></label>
                <textarea 
                  className="form-input description-box" 
                  placeholder="e.g. Water is knee-deep, cars are turning back."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </section>

              {/* Auto Captured Location Metadata Box */}
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
                    <input 
                      type="text" 
                      className="location-inline-input"
                      value={newLocationName}
                      onChange={(e) => setNewLocationName(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                    <p className="meta">Captured automatically</p>
                  </div>
                </div>
                <button type="button" className="adjust-location-btn">Not your location? <strong>Adjust</strong></button>
              </section>

              <footer className="form-footer">
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Verifying location...' : 'Continue'}
                </button>
              </footer>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}