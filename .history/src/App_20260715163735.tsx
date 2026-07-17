import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

// 1. Import Mapbox's core CSS rules so controls render perfectly
import 'mapbox-gl/dist/mapbox-gl.css';

// 2. Import your custom, rock-solid data type from your types.ts file
import { FloodReport } from './types.ts';

// 3. Set up your private developer access token from Mapbox
mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

// 4. Mock data list using real Lagos geographic points
const LAGOS_FLOOD_REPORTS: FloodReport[] = [
  {
    id: 1,
    locationName: "Lekki Phase 1",
    coordinates: [3.4841, 6.4281],
    imageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=400",
    waterLevel: "High",
    status: "Active"
  },
  {
    id: 2,
    locationName: "Ikeja Mainland",
    coordinates: [3.3515, 6.5920],
    imageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=400",
    waterLevel: "Medium",
    status: "Active"
  }
];

export default function App() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  
  // React Hooks managing our interactive UI states
  const [selectedReport, setSelectedReport] = useState<FloodReport | null>(null);
  const [isReporting, setIsReporting] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // SOLUTION 1 FIX: Strictly type the boundary limits as a fixed 2-element tuple
    const lagosBounds: [ [number, number], [number, number] ] = [
      [2.6924, 6.2201], // Southwest edge (Badagry coastal side)
      [4.2505, 6.7020]  // Northeast edge (Epe/Ikorodu inland side)
    ];

    // Instantiate and inject the background Mapbox canvas engine
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Replicates a dark-mode tracker base theme
      center: [3.4064, 6.4654], // Centers view on the heart of Lagos
      zoom: 11,
      maxBounds: lagosBounds, // Validated safely by TypeScript compiler!
      minZoom: 10
    });

    // Map over your data to add the custom Figma photo pins
    LAGOS_FLOOD_REPORTS.forEach((report) => {
      // Build standard HTML container element for the pin image
      const markerEl = document.createElement('div');
      markerEl.className = 'photo-marker';
      markerEl.style.backgroundImage = `url(${report.imageUrl})`;

      // Listen for click updates to dynamically change global React states
      markerEl.addEventListener('click', () => {
        setSelectedReport(report);
      });

      new mapboxgl.Marker({ element: markerEl })
        .setLngLat(report.coordinates)
        .addTo(mapRef.current!);
    });

    // Clean up map resources if the main view component is unmounted
    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      
      {/* Background container grid layer where Mapbox draws */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* FLOATING LAYER: Top Alert Banner */}
      <div className="alert-banner">
        ⚠️ Flood Watch Active: Expect heavy rainfall across Lagos State
      </div>

      {/* FLOATING LAYER: Bottom Interaction Call-to-Action */}
      {!isReporting && !selectedReport && (
        <button className="report-trigger-btn" onClick={() => setIsReporting(true)}>
          Report Flooding
        </button>
      )}

      {/* OVERLAY COMPONENT PANEL: Dynamic Info Details Card */}
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
            <p style={{ marginTop: '12px', marginBottom: '12px' }}>
              Current Status: <strong>{selectedReport.status}</strong>
            </p>
            <img src={selectedReport.imageUrl} alt="User flood preview" className="preview-img" />
          </div>
        </div>
      )}

      {/* OVERLAY COMPONENT PANEL: Report submission trigger */}
      {isReporting && (
        <div className="slide-up-panel">
          <div className="panel-header">
            <h3>Submit New Flood Report</h3>
            <button className="close-btn" onClick={() => setIsReporting(false)}>✕</button>
          </div>
          <div className="panel-body">
            <p style={{ marginBottom: '16px' }}>Ready to document localized levels? Set up your verification camera layout next.</p>
            <button className="camera-btn">Open Camera Guidance</button>
          </div>
        </div>
      )}
      
    </main>
  );
}