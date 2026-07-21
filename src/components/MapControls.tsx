// import { Color } from 'maplibre-gl';
import React, { useState } from 'react';

interface MapControlsProps {
  handleRecenterLocation: () => void;
  handleInfoClick?: () => void; // Keeps support for optional parent notifications
}

const severityLevels = [
  { color: '#EF4444', label: 'High severity' },
  { color: '#F97316', label: 'Medium severity' },
  { color: '#FBBF24', label: 'Low severity' },
];

const statusLevels = [
  { ringColor: '#9CA3AF', label: 'Verified report: solid ring', filled: true },
  { ringColor: '#9CA3AF', label: 'Unverified report: pulsing', filled: false},
  { ringColor: '#D1D5DB', label: 'Likely resolved: faded', faded: true },
];

export default function MapControls({ handleRecenterLocation, handleInfoClick }: MapControlsProps) {
  const [showLegend, setShowLegend] = useState(false);

  const toggleLegend = () => {
    setShowLegend(!showLegend);
    if (handleInfoClick) handleInfoClick();
  };

  return (
    <div 
      style={{ 
        position: 'absolute', 
        right: '46px', 
        bottom: '150px', 
        zIndex: 10, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-end',
        gap: '12px', 
        pointerEvents: 'auto' 
      }}
    >
      {/* Dynamic Legend Panel Pop-up */}
      {showLegend && (
        <div 
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px', 
            padding: '10px',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
            width: '160px', 
            fontFamily: 'system-ui, sans-serif',
            marginBottom: '0px',
            position: 'relative',
            right: '50px',
            top: '60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left'
          }}
        >
          {/* Close Button */}
          <button 
            onClick={() => setShowLegend(false)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              color: '#9CA3AF',
              lineHeight: 1
            }}
          >
            ×
          </button>

          <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#111827', margin: '0 0 4px 0' }}>Map key</h2>
          <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 8px 0' }}>Color always = severity. Ring style always = status.</p>

          {/* Severity Section */}
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 10px 0' }}>Severity</h3>
          {severityLevels.map((level) => (
            <div key={level.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', fontSize: '11px', color: '#374151' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: level.color, flexShrink: 0 }} />
              <span>{level.label}</span>
            </div>
          ))}

          {/* Status Section */}
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '16px 0 10px 0' }}>Status</h3>
          {statusLevels.map((level) => (
            <div key={level.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', fontSize: '11px', color: '#374151', opacity: level.faded ? 0.6 : 1 }}>
              <div style={{ 
                width: '14px', 
                height: '14px', 
                borderRadius: '50%', 
                border: `2px solid ${level.ringColor}`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0 
              }}>
                {level.filled && <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: level.ringColor }} />}
              </div>
              <span>{level.label}</span>
            </div>
          ))}

          {/* Your Location Tracker Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', fontSize: '13px', color: '#374151' }}>
            <div style={{ width: '20px', height: '20px', position: 'relative', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '20px', height: '20px', backgroundColor: '#3B82F6', borderRadius: '50%', opacity: 0.15 }} />
              <div style={{ position: 'absolute', top: '2px', left: '2px', width: '12px', height: '12px', backgroundColor: '#3B82F6', borderRadius: '50%', border: '2px solid #FFFFFF' }} />
            </div>
            <span>Your location</span>
          </div>
        </div>
      )}

      {/* Information (i) Button */}
      <button 
        onClick={toggleLegend}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: showLegend ? '#F3F4F6' : '#FFFFFF',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </button>

      {/* Recenter Location Button */}
      <button 
        onClick={handleRecenterLocation}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: '#FFFFFF',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
          cursor: 'pointer'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000205" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8" />
          <line x1="12" y1="1" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="23" />
          <line x1="1" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="23" y2="12" />
        </svg>
      </button>
    </div>
  );
}