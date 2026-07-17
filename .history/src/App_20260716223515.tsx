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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // INTEGRATED FIX: Track multiple captured images in an array
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  // Capture handler enforcing the 2-photo maximum threshold
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
    // Clear the input value so the user can capture/re-select files seamlessly
    e.target.value = '';
  };

  // Handler to delete an image (supports down to 0 images minimum)
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
      } else {
        alert(`We couldn't pinpoint "${newLocationName}" inside Lagos. Pinning to default coordinates.`);
      }

      const newReport: FloodReport = {
        id: Date.now(),
        locationName: newLocationName,
        coordinates: targetCoordinates,
        // Grabs the first image if present, defaults to placeholder if minimum (0) images provided
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
      setNewLocationName('');
      setCapturedImages([]); // Reset images array
      setIsReporting(false);
    }
  };

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Native Camera input layer shared by navbar and inner panel */}
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
            <button className="report-trigger-btn" onClick={() => setIsReporting(false)}>
              <img src={mapIcon} alt="MapIcon" width={24} height={24} /> Maps
            </button>
          )}

          {!isReporting && !selectedReport && (
            <button className="report-trigger-btn" onClick={() => alert("Navigating to feed view...")}>
              <img src={feedIcon} alt="FeedIcon" width={24} height={24} /> Feed
            </button>
          )}

          {/* Core Camera Action Button */}
          {!isReporting && !selectedReport && (
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
              <img src={cameraIcon} alt="CameraIcon" width={24} height={24} />
              Report
            </button>
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

        {/* SUBMIT REPORT FORM */}
        {isReporting && (
          <div className="slide-up-panel" style={{ pointerEvents: 'auto' }}>
            <div className="panel-header">
              <h3>Submit New Flood Report</h3>
              <button className="close-btn" onClick={() => {
                setIsReporting(false);
                setCapturedImages([]);
              }}>✕</button>
            </div>
            <form onSubmit={handleReportSubmit} className="panel-body">
              
              {/* Dynamic Image Grid Preview with Delete Badges */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  Evidence Images ({capturedImages.length}/2):
                </label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {capturedImages.map((imgUrl, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '75px', height: '75px' }}>
                      <img 
                        src={imgUrl} 
                        alt="Preview grid item" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #444' }} 
                      />
                      <button 
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        style={{
                          position: 'absolute', top: '-6px', right: '-6px',
                          background: '#FF3B30', color: '#fff', border: 'none',
                          borderRadius: '50%', width: '20px', height: '20px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', cursor: 'pointer', fontWeight: 'bold'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Show add button inline only if under the 2-photo max threshold */}
                  {capturedImages.length < 2 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        width: '75px', height: '75px', borderRadius: '8px',
                        border: '2px dashed #666', background: '#222', color: '#aaa',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', fontSize: '11px', cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontSize: '16px', fontWeight: 'bold' }}>+</span>
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px' }}>Nearest Location / Landmark:</label>
                <input 
                  type="text" 
                  placeholder="e.g. Victoria Island Highway, Surulere" 
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