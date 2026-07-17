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
  const [newLocationName, setNewLocationName] = useState('');
  const [newWaterLevel, setNewWaterLevel] = useState<'Low' | 'Medium' | 'High'>('Low');
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // State elements for camera preview and submission loaders
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Camera capture trigger
  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const localImageUrl = URL.createObjectURL(file);
      setCapturedImage(localImageUrl);
      setIsReporting(true); 
    }
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

  // LIVE ACCURATE SUBMISSION HANDLER WITH MAPTILER GEOCODING
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationName.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 1. Call MapTiler's Geocoding API with limits restricting results to Lagos (bbox) 
      // and proximity biasing near central Lagos coordinates
      const geocodeUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(newLocationName)}.json?key=${MAPTILER_KEY}&bbox=2.6924,6.2201,4.2505,6.7020&proximity=3.4064,6.4654`;
      
      const response = await fetch(geocodeUrl);
      const data = await response.json();

      let targetCoordinates: [number, number] = [3.4064, 6.4654]; // Default backup coordinates

      if (data.features && data.features.length > 0) {
        // MapTiler geocoding results return as [longitude, latitude]
        targetCoordinates = data.features[0].geometry.coordinates as [number, number];
      } else {
        alert(`We couldn't pinpoint "${newLocationName}" inside Lagos. Falling back to default Lagos coordinates.`);
      }

      // 2. Create the precise report object
      const newReport: FloodReport = {
        id: Date.now(),
        locationName: newLocationName,
        coordinates: targetCoordinates,
        imageUrl: capturedImage || "https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=400",
        waterLevel: newWaterLevel,
        status: "Verified"
      };

      setReports(prev => [...prev, newReport]);

      // 3. Smoothly pan/zoom the map view layout directly onto the verified location pin
      mapRef.current?.flyTo({
        center: targetCoordinates,
        zoom: 14,
        essential: true
      });

    } catch (error) {
      console.error("Geocoding failed:", error);
      alert("Network lookup error. Placing pin dynamically.");
    } finally {
      setIsSubmitting(false);
      setNewLocationName('');
      setCapturedImage(null);
      setIsReporting(false);
    }
  };

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />
      
      <div style={{ position: 'relative', zIndex: 2, pointerEvents: 'none', width: '100%', height: '100%' }}>
        <div className="alert-banner" style={{ pointerEvents: 'auto' }}>
          🚨 Real-Time Tracking: {reports.length} Active Flood Reports in Lagos
        </div>

        {/* BOTTOM NAVIGATION BAR PANEL */}
        <div className='navBar' style={{ pointerEvents: 'auto' }}>

          {!isReporting && !selectedReport && (
            <button className="report-trigger-btn" onClick={() => setIsReporting(false)}>
              <img src={mapIcon} alt="MapIcon" width={24} height={24} /> Maps
            </button>
          )}

          {!isReporting && !selectedReport && (
            <button className="report-trigger-btn" onClick={() => alert("Navigating to feed view...")}>
              <img src={feedIcon} alt="FeedIcon" width={24} height={24} /> Feed
            </button>
          )}

          {/* Camera Trigger */}
          {!isReporting && !selectedReport && (
            <>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={fileInputRef}
                style={{ display: 'none' }} 
                onChange={handleCameraCapture}
              />
              <button 
                className="report-trigger-btn-camera" 
                onClick={() => fileInputRef.current?.click()}
              >
                <img src={cameraIcon} alt="CameraIcon" width={24} height={24} />
                Report
              </button>
            </>
          )}

          {!isReporting && !selectedReport && (
            <button className="report-trigger-btn" onClick={() => alert("Checking area warnings...")}>
              <img src={alertIcon} alt="AlertIcon" width={24} height={24} /> Alerts
            </button>
          )}

          {!isReporting && !selectedReport && (
            <button className="report-trigger-btn" onClick={() => alert("Opening profile menu...")}>
              <img src={profileIcon} alt="ProfileIcon" width={24} height={24} /> Profile
            </button>
          )}
        </div>

        {/* POPUP REPORT PANEL WINDOW */}
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

        {/* SUBMIT NEW REPORT DIALOG */}
        {isReporting && (
          <div className="slide-up-panel" style={{ pointerEvents: 'auto' }}>
            <div className="panel-header">
              <h3>Submit New Flood Report</h3>
              <button className="close-btn" onClick={() => {
                setIsReporting(false);
                setCapturedImage(null);
              }}>✕</button>
            </div>
            <form onSubmit={handleReportSubmit} className="panel-body">
              
              {capturedImage && (
                <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                  <label style={{ display: 'block', marginBottom: '6px', textAlign: 'left' }}>Your Captured Image:</label>
                  <img 
                    src={capturedImage} 
                    alt="Flood evidence preview" 
                    style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} 
                  />
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px' }}>Nearest Location / Landmark:</label>
                <input 
                  type="text" 
                  placeholder="e.g. Lekki Conservation Centre, Surulere, Ikeja..." 
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#222', color: '#fff' }}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px' }}>Water Severity Level:</label>
                <select 
                  value={newWaterLevel} 
                  onChange={(e) => setNewWaterLevel(e.target.value as 'Low' | 'Medium' | 'High')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#222', color: '#fff' }}
                  disabled={isSubmitting}
                >
                  <option value="Low">Low (Ankle Deep)</option>
                  <option value="Medium">Medium (Knee Deep)</option>
                  <option value="High">High (Severe Vehicles Flooded)</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="camera-btn" 
                style={{ background: isSubmitting ? '#555' : '#00E676', color: '#121212', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying Location...' : 'Publish Report Instantly'}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}