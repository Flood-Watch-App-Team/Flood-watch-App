import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import Auth from './Auth';
import TopHeader from './components/TopHeader';
import MapControls from './components/MapControls';
import BottomNav from './components/BottomNav';
import type { FloodReport } from './type';

import cameraIcon from "./assets/camera-01.svg";
import mapIcon from "./assets/maps.svg";
import feedIcon from "./assets/menu-03 copy.svg";
import alertIcon from "./assets/notification-02.svg";

const MAPTILER_KEY = 'kaeXCvS4tEksnniL7N1x';
const LAGOS_STRICT_BOUNDS: [ [number, number], [number, number] ] = [
  [2.7000, 6.2000], [4.3000, 6.7500]
];

const LAGOS_FLOOD_REPORTS: FloodReport[] = [
  {
    id: 1,
    locationName: "Chevron Drive",
    coordinates: [3.5358, 6.4430],
    imageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=400",
    images: ["https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=400"],
    waterLevel: "Medium",
    status: "Unverified",
    confirmations: 3,
    photosCount: 1,
    timeActive: "1hr 20m",
    createdAt: Date.now() - 80 * 60 * 1000
  }
];

type TabType = 'maps' | 'feed' | 'report' | 'alerts' | 'profile';
type ConfirmStep = 'initial' | 'add_photo' | 'confirmed_view';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  
  const [reports, setReports] = useState<FloodReport[]>(LAGOS_FLOOD_REPORTS);
  const [selectedReport, setSelectedReport] = useState<FloodReport | null>(null);
  const [isReporting, setIsReporting] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<TabType>('maps');
  const [reportingStage, setReportingStage] = useState<'form' | 'adjust'>('form');
  
  const [confirmStep, setConfirmStep] = useState<ConfirmStep>('initial');
  const [userAddedPhoto, setUserAddedPhoto] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [mainSearchQuery, setMainSearchQuery] = useState('');
  const [displayedLocation, setDisplayedLocation] = useState('Lagos, Nigeria');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newLocationName, setNewLocationName] = useState('Admiralty Way, Lekki Phase 1');
  const [currentCoords, setCurrentCoords] = useState<[number, number] | null>([3.3792, 6.5244]);
  const [isManualLocation, setIsManualLocation] = useState<boolean>(false);
  
  // None active by default until clicked
  const [newWaterLevel, setNewWaterLevel] = useState<'Low' | 'Medium' | 'High' | null>(null);
  const [description, setDescription] = useState('');
  
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const confirmFileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  const [userVotes, setUserVotes] = useState<Record<number, 'yes' | 'no'>>({});

  const handleAuthComplete = (username: string) => {
    setCurrentUser(username || 'User');
    setIsAuthenticated(true);
    setCurrentTab('maps');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    setCurrentTab('maps');
    setIsReporting(false);
  };

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name.trim().slice(0, 2).toUpperCase();
  };

  const getSeverityColor = (level: 'Low' | 'Medium' | 'High') => {
    switch (level) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F97316';
      case 'Low': return '#FBBF24';
      default: return '#EF4444';
    }
  };

  const fetchLocationName = async (lng: number, lat: number) => {
    try {
      const response = await fetch(`https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_KEY}`);
      const data = await response.json();
      if (data.features && data.features.length > 0) return data.features[0].place_name;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const handleRecenterLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { longitude, latitude } = position.coords;
          setCurrentCoords([longitude, latitude]);
          mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 15, essential: true });
          const placeName = await fetchLocationName(longitude, latitude);
          setDisplayedLocation(placeName);
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { longitude, latitude } = position.coords;
          setCurrentCoords([longitude, latitude]);
          mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 14 });
          const placeName = await fetchLocationName(longitude, latitude);
          setDisplayedLocation(placeName);
          setNewLocationName(placeName);
        },
        () => {
          setCurrentCoords([3.3792, 6.5244]);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!mapRef.current || !isReporting || reportingStage !== 'adjust') return;
    const map = mapRef.current;
    const handleMapMoveContinuous = () => {
      const center = map.getCenter();
      if (center) {
        setCurrentCoords([center.lng, center.lat]);
        setIsManualLocation(true);
      }
    };
    const handleMapMoveEnd = async () => {
      const center = map.getCenter();
      if (center) {
        const name = await fetchLocationName(center.lng, center.lat);
        setNewLocationName(name);
      }
    };
    map.on('move', handleMapMoveContinuous);
    map.on('moveend', handleMapMoveEnd);
    return () => {
      map.off('move', handleMapMoveContinuous);
      map.off('moveend', handleMapMoveEnd);
    };
  }, [isReporting, reportingStage]);

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (capturedImages.length >= 2) {
        alert("Maximum limit reached.");
        return;
      }
      const localImageUrl = URL.createObjectURL(files[0]);
      setCapturedImages(prev => [...prev, localImageUrl]);
      if (mapRef.current) {
        const center = mapRef.current.getCenter();
        setCurrentCoords([center.lng, center.lat]);
      }
      setIsReporting(true);
      setCurrentTab('report');
    }
    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setCapturedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    if (!isAuthenticated || !mapContainerRef.current || mapRef.current) return;
    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
      center: currentCoords || [3.3792, 6.5244],
      zoom: 11,
      minZoom: 9.5,
      maxBounds: LAGOS_STRICT_BOUNDS
    });
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !mapRef.current) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    reports.forEach((report) => {
      const markerEl = document.createElement('div');

      if (report.status === 'Verified') {
        markerEl.className = 'photo-marker-wrapper';

        const badgeEl = document.createElement('div');
        badgeEl.className = 'photo-marker-badge';
        badgeEl.style.backgroundImage = `url(${report.imageUrl})`;

        if (report.photosCount > 0) {
          const countEl = document.createElement('div');
          countEl.className = 'photo-marker-count';
          countEl.innerText = `${report.photosCount}`;
          badgeEl.appendChild(countEl);
        }

        const arrowEl = document.createElement('div');
        arrowEl.className = 'photo-marker-arrow';

        markerEl.appendChild(badgeEl);
        markerEl.appendChild(arrowEl);
      } else {
        const color = getSeverityColor(report.waterLevel);
        markerEl.className = 'pulse-marker-container';

        const auraEl = document.createElement('div');
        auraEl.className = 'pulse-marker-aura';
        auraEl.style.backgroundColor = color;

        const coreEl = document.createElement('div');
        coreEl.className = 'pulse-marker-core';
        coreEl.style.backgroundColor = color;

        markerEl.appendChild(auraEl);
        markerEl.appendChild(coreEl);
      }

      markerEl.addEventListener('click', () => {
        setSelectedReport(report);
        setConfirmStep('initial');
        setUserAddedPhoto(false);
        mapRef.current?.flyTo({
          center: report.coordinates,
          zoom: 15,
          essential: true
        });
      });

      const newMarker = new maplibregl.Marker({ element: markerEl, anchor: 'bottom' })
        .setLngLat(report.coordinates)
        .addTo(mapRef.current!);

      markersRef.current.push(newMarker);
    });
  }, [reports, isAuthenticated]);

  const handleMapsTabClick = () => {
    setCurrentTab('maps');
    setIsReporting(false);
    mapRef.current?.flyTo({ center: currentCoords || [3.3792, 6.5244], zoom: 14 });
  };

  const handleMainSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainSearchQuery.trim()) return;
    try {
      const response = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(mainSearchQuery)}.json?key=${MAPTILER_KEY}`);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        setDisplayedLocation(feature.place_name);
        setCurrentCoords(feature.center);
        mapRef.current?.flyTo({ center: feature.center, zoom: 14 });
        setMainSearchQuery('');
      }
    } catch (err) { console.error(err); }
  };

  const handleManualSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const response = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${MAPTILER_KEY}`);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        setNewLocationName(data.features[0].place_name);
        setCurrentCoords(data.features[0].center);
        setIsManualLocation(true);
        mapRef.current?.flyTo({ center: data.features[0].center, zoom: 16.5 });
      }
    } catch (err) { console.error(err); }
  };

  const selectQuickTag = async (tag: string) => {
    setSearchQuery(tag);
    setIsManualLocation(true);
    setNewLocationName(`${tag}, Lekki Phase 1`);
    const positions: Record<string, [number, number]> = {
      'Admiralty Way': [3.4841, 6.4281], 'Chevron Drive': [3.5358, 6.4430], 'Freedom Way': [3.4920, 6.4350]
    };
    if (positions[tag]) {
      setCurrentCoords(positions[tag]);
      mapRef.current?.flyTo({ center: positions[tag], zoom: 16.5 });
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!newWaterLevel) {
      alert("Please select severity level");
      return;
    }
    setIsSubmitting(true);
    const targetCoordinates: [number, number] = currentCoords || [3.3792, 6.5244];
    const imageList = capturedImages.length > 0 ? capturedImages : ["https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=400"];

    const newReport: FloodReport = {
      id: Date.now(),
      locationName: newLocationName,
      coordinates: targetCoordinates,
      imageUrl: imageList[0],
      images: imageList,
      waterLevel: newWaterLevel,
      status: "Unverified",
      confirmations: 0,
      photosCount: imageList.length,
      timeActive: "Just now",
      createdAt: Date.now()
    };

    setReports(prev => [...prev, newReport]);
    mapRef.current?.flyTo({ center: targetCoordinates, zoom: 15 });
    setIsSubmitting(false); setDescription(''); setCapturedImages([]); setIsReporting(false);
    setIsManualLocation(false); setReportingStage('form'); setSearchQuery(''); setCurrentTab('maps');
    setNewWaterLevel(null);
  };

  const handleInitiateConfirm = () => {
    setConfirmStep('add_photo');
  };

  const applyConfirmation = (reportId: number, newPhotoUrl?: string) => {
    setReports(prevReports =>
      prevReports.map(rep => {
        if (rep.id === reportId) {
          const updatedConfirmations = userVotes[reportId] === 'yes' ? rep.confirmations : rep.confirmations + 1;
          const isNowVerified = updatedConfirmations >= 4;
          const updatedPhotos = newPhotoUrl ? [...(rep.images || [rep.imageUrl]), newPhotoUrl] : (rep.images || [rep.imageUrl]);

          const updatedReport: FloodReport = {
            ...rep,
            confirmations: updatedConfirmations,
            photosCount: updatedPhotos.length,
            images: updatedPhotos,
            imageUrl: updatedPhotos[0],
            status: isNowVerified ? 'Verified' : 'Unverified'
          };

          if (selectedReport?.id === reportId) {
            setSelectedReport(updatedReport);
          }
          return updatedReport;
        }
        return rep;
      })
    );

    setUserVotes(prev => ({ ...prev, [reportId]: 'yes' }));
  };

  const handleSkipPhotoAndConfirm = (reportId: number) => {
    applyConfirmation(reportId);
    setUserAddedPhoto(false);
    setConfirmStep('confirmed_view');
  };

  const handleConfirmPhotoCaptured = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && selectedReport) {
      const newImageUrl = URL.createObjectURL(files[0]);
      applyConfirmation(selectedReport.id, newImageUrl);
      setUserAddedPhoto(true);
      setConfirmStep('confirmed_view');
    }
    e.target.value = '';
  };

  const handleBackToMap = () => {
    setSelectedReport(null);
    setConfirmStep('initial');

    if (userAddedPhoto) {
      showToast("Confirmed, your photo was added to the gallery");
    } else {
      showToast("Confirmed, your feedback was recorded");
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleDeclineReport = (reportId: number) => {
    setUserVotes(prev => ({ ...prev, [reportId]: 'no' }));
  };

  if (!isAuthenticated) return <Auth onAuthComplete={handleAuthComplete} />;

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} style={{ display: 'none' }} onChange={handleCameraCapture} />
      <input type="file" accept="image/*" capture="environment" ref={confirmFileInputRef} style={{ display: 'none' }} onChange={handleConfirmPhotoCaptured} />

      <div ref={mapContainerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1 }} />
      
      {isReporting && reportingStage === 'adjust' && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)', zIndex: 2, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ transform: 'translateY(-4px)', animation: 'pinBounce 2s ease-in-out infinite alternate' }}>
            <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.15))' }}>
              <path d="M20 0C8.954 0 0 8.954 0 20C0 32.5 20 48 20 48C20 48 40 32.5 40 20C40 8.954 31.046 0 20 0Z" fill="#E11D48" />
              <circle cx="20" cy="18" r="7" fill="white" /><circle cx="20" cy="18" r="3.5" fill="#E11D48" />
            </svg>
          </div>
          <div style={{ width: '12px', height: '4px', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '50%', marginTop: '-2px', animation: 'shadowScale 2s ease-in-out infinite alternate' }} />
          <style>{`@keyframes pinBounce { 0% { transform: translateY(-4px); } 100% { transform: translateY(-10px); } } @keyframes shadowScale { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(0.6); opacity: 0.4; } }`}</style>
        </div>
      )}

      {!isReporting && currentTab === 'maps' && (
        <MapControls handleRecenterLocation={handleRecenterLocation} />
      )}

      <div style={{ position: 'relative', zIndex: 3, pointerEvents: 'none', width: '100%', height: '100%' }}>
        
        <TopHeader 
          isReporting={isReporting} reportingStage={reportingStage} setIsReporting={setIsReporting} 
          setCapturedImages={setCapturedImages} setCurrentTab={setCurrentTab} setReportingStage={setReportingStage}
          handleMainSearchSubmit={handleMainSearchSubmit} displayedLocation={displayedLocation}
          mainSearchQuery={mainSearchQuery} setMainSearchQuery={setMainSearchQuery} currentUser={currentUser} getUserInitials={getUserInitials}
        />

        {currentTab === 'profile' && !isReporting && (
          <div className="slide-up-panel" style={{ pointerEvents: 'auto', bottom: '80px', maxHeight: '75vh', overflowY: 'auto' }}>
            <div className="panel-header" style={{ paddingBottom: '12px', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#003366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>{getUserInitials(currentUser)}</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>@{currentUser}</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>Verified Flood Watcher</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setCurrentTab('maps')}>✕</button>
            </div>
            <div className="panel-body" style={{ padding: '16px 0' }}>
              <button onClick={handleLogout} style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>Log Out</button>
            </div>
          </div>
        )}

        <BottomNav 
          currentTab={currentTab} handleMapsTabClick={handleMapsTabClick} setCurrentTab={setCurrentTab}
          currentUser={currentUser} getUserInitials={getUserInitials} mapIcon={mapIcon} feedIcon={feedIcon}
          cameraIcon={cameraIcon} alertIcon={alertIcon}
          openReportingWorkflow={async () => {
            if (mapRef.current) {
              const center = mapRef.current.getCenter();
              setCurrentCoords([center.lng, center.lat]);
              setNewLocationName(await fetchLocationName(center.lng, center.lat));
            }
            setCurrentTab('report');
            setIsReporting(true);
            setNewWaterLevel(null);
          }}
        />

        {toastMessage && (
          <div 
            style={{
              position: 'absolute',
              bottom: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#1D4ED8',
              color: '#FFFFFF',
              padding: '12px 20px',
              borderRadius: '24px',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0px 8px 24px rgba(0,0,0,0.25)',
              zIndex: 20,
              pointerEvents: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {toastMessage}
          </div>
        )}

        {selectedReport && (
          <div 
            style={{ 
              pointerEvents: 'auto',
              position: 'absolute',
              bottom: '84px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '380px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.18)',
              zIndex: 10,
              fontFamily: 'sans-serif'
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: '150px' }}>
              <img 
                src={selectedReport.imageUrl} 
                alt="Flood Report" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <button 
                onClick={() => { setSelectedReport(null); setConfirmStep('initial'); }}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  color: '#FFF',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}
              >
                ✕
              </button>

              <span 
                style={{ 
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  fontSize: '11px', 
                  fontWeight: '600', 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getSeverityColor(selectedReport.waterLevel) }} />
                {selectedReport.waterLevel} Severity
              </span>
            </div>

            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                    {selectedReport.locationName}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                    Lekki Phase 1 • reported {selectedReport.timeActive} ago
                  </p>
                </div>

                <span 
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    backgroundColor: selectedReport.status === 'Verified' ? '#D1FAE5' : '#F3F4F6',
                    color: selectedReport.status === 'Verified' ? '#065F46' : '#6B7280'
                  }}
                >
                  {selectedReport.status}
                </span>
              </div>

              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr', 
                  gap: '8px', 
                  margin: '14px 0',
                  padding: '10px 8px',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '12px'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Confirmations</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', marginTop: '2px' }}>
                    ✓ {selectedReport.confirmations}
                  </div>
                </div>

                <div style={{ textAlign: 'center', borderLeft: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Photos</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', marginTop: '2px' }}>
                    🖼 {selectedReport.photosCount}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Time Active</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', marginTop: '2px' }}>
                    ⏱ {selectedReport.timeActive}
                  </div>
                </div>
              </div>

              {confirmStep === 'initial' && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                    Can you confirm this?
                  </p>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleDeclineReport(selectedReport.id)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        backgroundColor: userVotes[selectedReport.id] === 'no' ? '#E5E7EB' : '#FFFFFF',
                        border: '1px solid #D1D5DB',
                        color: '#374151',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      No, looks clear
                    </button>

                    <button 
                      onClick={handleInitiateConfirm}
                      disabled={userVotes[selectedReport.id] === 'yes'}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        backgroundColor: userVotes[selectedReport.id] === 'yes' ? '#10B981' : '#003366',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: userVotes[selectedReport.id] === 'yes' ? 'default' : 'pointer'
                      }}
                    >
                      {userVotes[selectedReport.id] === 'yes' ? 'Confirmed ✓' : 'Yes, I see it too'}
                    </button>
                  </div>
                </div>
              )}

              {confirmStep === 'add_photo' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>Submitted by the community</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {(selectedReport.images || [selectedReport.imageUrl]).map((img, i) => (
                      <img key={i} src={img} alt="community capture" style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                    ))}
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '6px' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '500', color: '#6B7280' }}>
                      Want to add a photo? (optional)
                    </p>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleSkipPhotoAndConfirm(selectedReport.id)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '10px',
                          backgroundColor: '#F3F4F6',
                          border: 'none',
                          color: '#374151',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Skip, just confirm
                      </button>

                      <button 
                        onClick={() => confirmFileInputRef.current?.click()}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '10px',
                          backgroundColor: '#003366',
                          border: 'none',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        📷 Add Photo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {confirmStep === 'confirmed_view' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>Submitted by the community</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px' }}>
                    {(selectedReport.images || [selectedReport.imageUrl]).map((img, i) => (
                      <img key={i} src={img} alt="community capture" style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                    ))}
                  </div>

                  <button 
                    onClick={handleBackToMap}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: '#003366',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginTop: '4px'
                    }}
                  >
                    Back to Map
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Report Floods Modal matching Figma */}
        {isReporting && (
          <>
            {reportingStage === 'form' && (
              <div 
                style={{ 
                  pointerEvents: 'auto',
                  position: 'absolute',
                  bottom: '84px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '90%',
                  maxWidth: '370px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '20px',
                  boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.18)',
                  zIndex: 10,
                  fontFamily: 'sans-serif'
                }}
              >
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Report flooding</h2>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#9CA3AF' }}>Takes about 15 seconds</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => { setIsReporting(false); setCapturedImages([]); setCurrentTab('maps'); setNewWaterLevel(null); }}
                    style={{ border: 'none', background: 'none', fontSize: '18px', color: '#9CA3AF', cursor: 'pointer', padding: '0 4px' }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleReportSubmit}>
                  {/* Photos Section */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Photos ({capturedImages.length}/2)
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {capturedImages.map((imgUrl, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden' }}>
                          <img src={imgUrl} alt="evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            type="button" 
                            onClick={() => handleRemoveImage(idx)}
                            style={{ position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFF', border: 'none', fontSize: '10px', cursor: 'pointer' }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {capturedImages.length < 2 && (
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          style={{ width: '60px', height: '60px', borderRadius: '10px', border: '1px dashed #D1D5DB', backgroundColor: '#F9FAFB', color: '#9CA3AF', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Severity Selector with color coding & default inactive state */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      How bad is it?
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* LOW */}
                      <button
                        type="button"
                        onClick={() => setNewWaterLevel('Low')}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          border: newWaterLevel === 'Low' ? '1px solid #CA8A04' : '1px solid #E5E7EB',
                          backgroundColor: newWaterLevel === 'Low' ? '#FEF9C3' : '#F9FAFB',
                          color: newWaterLevel === 'Low' ? '#854D0E' : '#4B5563'
                        }}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EAB308' }} />
                        Low
                      </button>

                      {/* MEDIUM */}
                      <button
                        type="button"
                        onClick={() => setNewWaterLevel('Medium')}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          border: newWaterLevel === 'Medium' ? '1px solid #003366' : '1px solid #E5E7EB',
                          backgroundColor: newWaterLevel === 'Medium' ? '#003366' : '#F9FAFB',
                          color: newWaterLevel === 'Medium' ? '#FFFFFF' : '#4B5563'
                        }}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: newWaterLevel === 'Medium' ? '#F97316' : '#F97316' }} />
                        Medium
                      </button>

                      {/* HIGH */}
                      <button
                        type="button"
                        onClick={() => setNewWaterLevel('High')}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          border: newWaterLevel === 'High' ? '1px solid #DC2626' : '1px solid #E5E7EB',
                          backgroundColor: newWaterLevel === 'High' ? '#FEE2E2' : '#F9FAFB',
                          color: newWaterLevel === 'High' ? '#991B1B' : '#4B5563'
                        }}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                        High
                      </button>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Description <span style={{ fontWeight: '400', color: '#9CA3AF' }}>(optional)</span>
                    </label>
                    <textarea 
                      placeholder="e.g. Water is knee-deep, cars are turning back" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '12px', resize: 'none', outline: 'none', boxSizing: 'border-box', backgroundColor: '#F9FAFB' }}
                    />
                  </div>

                  {/* Location Card */}
                   <div style={{ fontSize: '11px', color: '#000104', marginBottom: '2px', fontWeight: '600' }}>Location</div>

                  <div style={{ marginBottom: '5px', padding: '10px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <img src="/src/assets/location-06.svg" alt="" width={24} height={24} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                      {newLocationName}
                    </div>
                    
                    <div style={{ display: 'grid', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontSize: '10px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        
                        Captured automatically
                      </span>
                    </div>
                    </div>

                  </div>
                  
                  <button 
                        type="button" 
                        onClick={() => { setReportingStage('adjust'); if (mapRef.current && currentCoords) mapRef.current.flyTo({ center: currentCoords, zoom: 16.5 }); }}
                        style={{ border: 'none', background: 'none', color: '#070000', fontSize: '11px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                      >
                        Not your location? Adjust
                    </button>

                  {/* Submit Button */}
                  <button 
                    style={{ width: '100%', padding: '12px', borderRadius: '50px', backgroundColor: '#003366', color: '#FFFFFF', border: 'none', fontSize: '14px', fontWeight: '300', cursor: 'pointer', marginTop: '20px' }}
                  >
                    Continue
                  </button>
                </form>
              </div>
            )}

            {reportingStage === 'adjust' && (
              <div className="adjust-location-panel" style={{ pointerEvents: 'auto', position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
                <div style={{ background: '#fff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '20px' }}>
                  <h2>Adjust location</h2>
                  <form onSubmit={handleManualSearchSubmit}>
                    <input type="text" placeholder="Search a street or area" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setNewLocationName(e.target.value); setIsManualLocation(true); }} style={{ width: '100%', padding: '12px' }} />
                  </form>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 0' }}>
                    {['Admiralty Way', 'Chevron Drive', 'Freedom Way'].map((tag) => <button key={tag} type="button" onClick={() => selectQuickTag(tag)}>{tag}</button>)}
                  </div>
                  <button type="button" className="submit-btn" onClick={() => { if (mapRef.current) setCurrentCoords([mapRef.current.getCenter().lng, mapRef.current.getCenter().lat]); setReportingStage('form'); }} style={{ width: '100%', backgroundColor: '#003366', color: '#fff' }}>Continue</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}