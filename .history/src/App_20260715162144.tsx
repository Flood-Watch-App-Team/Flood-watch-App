import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

// Mock data following our TypeScript interface
const LAGOS_FLOOD_REPORTS: FloodReport[] = [
  {
    id: 1,
    locationName: "Lekki Phase 1",
    coordinates: [3.4841, 6.4281],
    imageUrl: "https://via.placeholder.com/150",
    waterLevel: "High",
    status: "Active"
  }
];

export default function App() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  
  // State to manage which report modal is currently pulled up
  const [selectedReport, setSelectedReport] = useState<FloodReport | null>(null);
  const [isReporting, setIsReporting] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Strict boundaries for Lagos State
    const lagosBounds: [number, number][] = [
      [2.6924, 6.2201], // Southwest
      [4.2505, 6.7020]  // Northeast
    ];

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Dark style matching the tracker vibe
      center: [3.4064, 6.4654], // Center on Lagos
      zoom: 11,
      maxBounds: lagosBounds,
      minZoom: 10
    });

    // Add custom photo markers onto the map layer
    LAGOS_FLOOD_REPORTS.forEach((report) => {
      const markerEl = document.createElement('div');
      markerEl.className = 'photo-marker';
      markerEl.style.backgroundImage = `url(${report.imageUrl})`;

      // When clicking the marker, update state to slide up the details modal
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
      {/* Background Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* FLOATING UI: Emergency Banner (Top) */}
      <div className="alert-banner">
        ⚠️ Flood Watch Active: Expect heavy rainfall across Lagos Mainland
      </div>

      {/* FLOATING UI: Action Button (Bottom) */}
      {!isReporting && !selectedReport && (
        <button className="report-trigger-btn" onClick={() => setIsReporting(true)}>
          Report Flooding
        </button>
      )}

      {/* OVERLAY PANEL: Custom Slide-Up Details Modal */}
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
            <p>Status: <strong>{selectedReport.status}</strong></p>
            <img src={selectedReport.imageUrl} alt="Flood preview" className="preview-img" />
          </div>
        </div>
      )}

      {/* OVERLAY PANEL: Report Form Slide-Up */}
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