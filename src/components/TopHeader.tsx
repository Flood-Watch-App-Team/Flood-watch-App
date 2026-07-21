import React from 'react';

interface TopHeaderProps {
  isReporting: boolean;
  reportingStage: 'form' | 'adjust';
  setIsReporting: (val: boolean) => void;
  setCapturedImages: React.Dispatch<React.SetStateAction<string[]>>;
  setCurrentTab: (tab: any) => void;
  setReportingStage: (stage: 'form' | 'adjust') => void;
  handleMainSearchSubmit: (e: React.FormEvent) => void;
  displayedLocation: string;
  mainSearchQuery: string;
  setMainSearchQuery: (val: string) => void;
  currentUser: string;
  getUserInitials: (name: string) => string;
}

export default function TopHeader({
  isReporting,
  reportingStage,
  setIsReporting,
  setCapturedImages,
  setCurrentTab,
  setReportingStage,
  handleMainSearchSubmit,
  displayedLocation,
  mainSearchQuery,
  setMainSearchQuery,
  currentUser,
  getUserInitials
}: TopHeaderProps) {
  return (
    <div 
      style={{ 
        pointerEvents: 'auto',
        position: 'absolute',
        top: '16px',
        left: '16px',
        right: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}
    >
      {isReporting ? (
        <button 
          onClick={() => {
            if (reportingStage === 'adjust') {
              setReportingStage('form');
            } else {
              setIsReporting(false);
              setCapturedImages([]);
              setCurrentTab('maps');
            }
          }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
            cursor: 'pointer'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      ) : (
        <div 
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#fafafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 'bold',
            letterSpacing: '-0.5px'
          }}
        >
         <img src="/src/assets/Floodwatchlogo.svg" alt="" width={24} height={24} />
        </div>
      )}

      <form 
        onSubmit={handleMainSearchSubmit}
        style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          margin: '0 12px',
          height: '44px',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
          padding: '0 16px',
          position: 'relative'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px', flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}>
          <span style={{ fontSize: '10px', color: '#9CA3AF', lineHeight: '1', marginBottom: '2px' }}>Current area</span>
          <input 
            type="text" 
            placeholder={displayedLocation} 
            value={mainSearchQuery}
            onChange={(e) => setMainSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              fontWeight: 600,
              color: '#1F2937',
              lineHeight: '1',
              padding: 0,
              width: '100%',
              backgroundColor: 'transparent'
            }}
          />
        </div>
      </form>

      <button 
        onClick={() => setCurrentTab('profile')}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#fcfcfc',
          color: '#FFFFFF',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '14px'
        }}
      >
        <img src="/src/assets/cloud.svg" alt="" width={24} height={24} />
      </button>
    </div>
  );
}