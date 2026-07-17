import { useEffect, useRef, useState } from 'react';

// 1. import maplibre-gl
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import type { FloodReport } from './type';

import cameraIcon from "./assets/camera-01.svg"
import mapIcon from "./assets/maps.svg"
import feedIcon from "./assets/menu-03 copy.svg"
import alertIcon from "./assets/notification-02.svg"
import profileIcon from "./assets/user.svg"
// 2. input MapTiler Key here
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

// 1. Create a reference to our hidden camera input
const fileInputRef = useRef<HTMLInputElement>(null);

// 2. State to hold the captured photo URL
const [capturedImage, setCapturedImage] = useState<string | null>(null);
const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (files && files.length > 0) {
    const file = files[0];
    
    // Create a local URL for the image so we can display it in our preview
    const localImageUrl = URL.createObjectURL(file);
    
    setCapturedImage(localImageUrl);
    setIsReporting(true); // Automatically slide up the panel after snapping the photo!
  }
};
export default function App() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  
  const [reports, setReports] = useState<FloodReport[]>(LAGOS_FLOOD_REPORTS);
  const [selectedReport, setSelectedReport] = useState<FloodReport | null>(null);
  const [isReporting, setIsReporting] = useState<boolean>(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newWaterLevel, setNewWaterLevel] = useState<'Low' | 'Medium' | 'High'>('Low');
  const markersRef = useRef<maplibregl.Marker[]>([]);

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

      // 4. CHANGE: Use maplibregl for markers
      const newMarker = new maplibregl.Marker({ element: markerEl })
        .setLngLat(report.coordinates)
        .addTo(mapRef.current!);

      markersRef.current.push(newMarker);
    });
  }, [reports]);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationName.trim()) return;

    const randomLng = 3.35 + Math.random() * 0.15;
    const randomLat = 6.43 + Math.random() * 0.15;

    const newReport: FloodReport = {
      id: Date.now(),
      locationName: newLocationName,
      coordinates: [randomLng, randomLat],
      imageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=400",
      waterLevel: newWaterLevel,
      status: "Verified"
    };

    setReports(prev => [...prev, newReport]);
    setNewLocationName('');
    setIsReporting(false);
  };

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />
      
      <div style={{ position: 'relative', zIndex: 2, pointerEvents: 'none', width: '100%', height: '100%' }}>
        <div className="alert-banner" style={{ pointerEvents: 'auto' }}>
          🚨 Real-Time Tracking: {reports.length} Active Flood Reports in Lagos
        </div>

        <div className='navBar'>

          {/* {/* {!isReporting && !selectedReport && ( */}
          <button className="report-trigger-btn" style={{ pointerEvents: 'auto' }} onClick={() => setIsReporting(true)}>
           <img src={mapIcon} alt="MapIcon" width={24} height={24} /> Maps
          </button>
        )} */}

          {/* {!isReporting && !selectedReport && (
          <button className="report-trigger-btn" style={{ pointerEvents: 'auto' }} onClick={() => setIsReporting(true)}>
           <img src={feedIcon} alt="FeedIcon" width={24} height={24} /> Feed
          </button>
        )} */}

          {!isReporting && !selectedReport && (
  <>
    {/* Hidden native camera input */}
    <input 
      type="file" 
      accept="image/*" 
      capture="environment" // Forces mobile browsers to open the rear-facing camera
      ref={fileInputRef}
      style={{ display: 'none' }} 
      onChange={handleCameraCapture}
    />

    {/* Your Report Button (Triggers the camera input when clicked) */}
    <button 
      className="report-trigger-btn-camera" 
      style={{ pointerEvents: 'auto' }} 
      onClick={() => fileInputRef.current?.click()} // Trigger the camera programmatically!
    >
      <img src={cameraIcon} alt="CameraIcon" width={24} height={24} />
      Report
    </button>
  </>
)}

          {/* {!isReporting && !selectedReport && (
          <button className="report-trigger-btn" style={{ pointerEvents: 'auto' }} onClick={() => setIsReporting(true)}>
           <img src={alertIcon} alt="AlertIcon" width={24} height={24} /> Alerts
          </button>
        )} */}

          {/* {!isReporting && !selectedReport && (
          <button className="report-trigger-btn" style={{ pointerEvents: 'auto' }} onClick={() => setIsReporting(true)}>
           <img src={profileIcon} alt="ProfileIcon" width={24} height={24} /> Profile
          </button>
        )} */}
        </div>

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

        {isReporting && (
          <div className="slide-up-panel" style={{ pointerEvents: 'auto' }}>
            <div className="panel-header">
              <h3>Submit New Flood Report</h3>
              <button className="close-btn" onClick={() => setIsReporting(false)}>✕</button>
            </div>
            <form onSubmit={handleReportSubmit} className="panel-body">
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px' }}>Nearest Location / Landmark:</label>
                <input 
                  type="text" 
                  placeholder="e.g. Victoria Island Highway" 
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#222', color: '#fff' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px' }}>Water Severity Level:</label>
                <select 
                  value={newWaterLevel} 
                  onChange={(e) => setNewWaterLevel(e.target.value as 'Low' | 'Medium' | 'High')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#222', color: '#fff' }}
                >
                  <option value="Low">Low (Ankle Deep)</option>
                  <option value="Medium">Medium (Knee Deep)</option>
                  <option value="High">High (Severe Vehicles Flooded)</option>
                </select>
              </div>

              <button type="submit" className="camera-btn" style={{ background: '#00E676', color: '#121212' }}>
                Publish Report Instantly
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}