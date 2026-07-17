import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

// 1. Bring in the official Mapbox stylesheet so map controls display properly
import 'mapbox-gl/dist/mapbox-gl.css';

// 2. Set up your private developer access token
mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

// 3. Define the strict data structure shape for TypeScript compiler safety
interface FloodReport {
  id: number;
  locationName: string;
  coordinates: [number, number]; // [longitude, latitude]
  imageUrl: string;
  waterLevel: 'Low' | 'Medium' | 'High';
  status: 'Active' | 'Receding';
}

// 4. Mock data array populated using your design coordinates
const LAGOS_FLOOD_REPORTS: FloodReport[] = [
  {
    id: 1,
    locationName: "Lekki Phase 1",
    coordinates: [3.4841, 6.4281],
    imageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=200",
    waterLevel: "High",
    status: "Active"
  }
];

export default function App() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  
  // Explicitly tell TypeScript these hooks manage either a FloodReport object or null
  const [selectedReport, setSelectedReport] = useState<FloodReport | null>(null);
  const [isReporting, setIsReporting] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const lagosBounds: [number, number][] = [
      [2.6924, 6.2201], // Southwest Boundary
      [4.2505, 6.7020]  // Northeast Boundary
    ];

    // Create the background Mapbox engine layer inside the wrapper element
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Dark UI style
      center: [3.4064, 6.4654], // Center focus point on Lagos
      zoom: 11,
      maxBounds: lagosBounds,
      minZoom: 10
    });

    // Generate custom photo preview elements on top of the map grid
    LAGOS_FLOOD_REPORTS.forEach((report) => {
      const markerEl = document.createElement('div');
      markerEl.className = 'photo-marker';
      markerEl.style.backgroundImage = `url(${report.imageUrl})`;

      // Listen for click updates to control the UI state
      markerEl.addEventListener('click', () => {
        setSelectedReport(report);
      });

      new mapboxgl.Marker({ element: markerEl })
        .setLngLat(report.coordinates)
        .addTo(mapRef.current!);
    });

    return () => mapRef.current?.remove();
  }, []);

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Target wrapper target element linked via ref */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floated System Overlays */}
      <div className="alert-banner">
        ⚠️ Flood Watch Active: Expect heavy rainfall across Lagos Mainland
      </div>

      {!isReporting && !selectedReport && (
        <button className="report-trigger-btn" onClick={() => setIsReporting(true)}>
          Report Flooding
        </button>
      )}

      {selectedReport && (
        <div className="slide-up-panel">
          <div className="panel-header">
            <h3>{selectedReport.locationName}</h3>
            <button className="close-btn" onClick={() => setSelectedReport(null)}>✕</button>
          </div>
          <div className="panel-body">
            <span className={`badge ${selectedReport.waterLevel.toLowerCase()}`}>
              Water Level: {selectedReport.waterLevel}
            </span>
            <p style={{ marginTop: '8px' }}>Status: <strong>{selectedReport.status}</strong></p>
            <img src={selectedReport.imageUrl} alt="Flood preview" className="preview-img" />
          </div>
        </div>
      )}

      {isReporting && (
        <div className="slide-up-panel">
          <div className="panel-header">
            <h3>Submit New Flood Report</h3>
            <button className="close-btn" onClick={() => setIsReporting(false)}>✕</button>
          </div>
          <div className="panel-body">
            <p>Ready to capture flood levels? Align your camera system next.</p>
            <button className="camera-btn">Open Camera Guidance</button>
          </div>
        </div>
      )}
    </main>
  );
}