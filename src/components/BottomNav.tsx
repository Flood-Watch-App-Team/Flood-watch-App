import React from 'react';

interface BottomNavProps {
  currentTab: string;
  handleMapsTabClick: () => void;
  setCurrentTab: (tab: any) => void;
  openReportingWorkflow: () => void;
  currentUser: string;
  getUserInitials: (name: string) => string;
  mapIcon: string;
  feedIcon: string;
  cameraIcon: string;
  alertIcon: string;
}

export default function BottomNav({
  currentTab,
  handleMapsTabClick,
  setCurrentTab,
  openReportingWorkflow,
  currentUser,
  getUserInitials,
  mapIcon,
  feedIcon,
  cameraIcon,
  alertIcon
}: BottomNavProps) {
  return (
    <div className='navBar' style={{ pointerEvents: 'auto' }}>
      <button 
        className={`report-trigger-btn ${currentTab === 'maps' ? 'active' : ''}`} 
        onClick={handleMapsTabClick} 
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <img src={mapIcon} alt="MapIcon" width={24} height={24} />
        {currentTab === 'maps' && <span style={{ width: '5px', height: '5px', backgroundColor: '#000000', borderRadius: '50%', margin: '3px 0' }} />}
        Maps
      </button>

      <button 
        className={`report-trigger-btn ${currentTab === 'feed' ? 'active' : ''}`} 
        onClick={() => setCurrentTab('feed')} 
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <img src={feedIcon} alt="FeedIcon" width={24} height={24} />
        {currentTab === 'feed' && <span style={{ width: '5px', height: '5px', backgroundColor: '#000000', borderRadius: '50%', margin: '3px 0' }} />}
        Feed
      </button>

      <button 
        className={`report-trigger-btn-camera ${currentTab === 'report' ? 'active' : ''}`}
        onClick={openReportingWorkflow}
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <img src={cameraIcon} alt="CameraIcon" width={24} height={24} />
        
        Report
      </button>

      <button 
        className={`report-trigger-btn ${currentTab === 'alerts' ? 'active' : ''}`} 
        onClick={() => setCurrentTab('alerts')} 
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <img src={alertIcon} alt="AlertIcon" width={24} height={24} />
        {currentTab === 'alerts' && <span style={{ width: '5px', height: '5px', backgroundColor: '#000000', borderRadius: '50%', margin: '3px 0' }} />}
        Alerts
      </button>

      <button 
        className={`report-trigger-btn ${currentTab === 'profile' ? 'active' : ''}`} 
        onClick={() => setCurrentTab('profile')} 
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: currentTab === 'profile' ? '#003366' : '#9CA3AF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>
          {getUserInitials(currentUser)}
        </div>
        {currentTab === 'profile' && <span style={{ width: '5px', height: '5px', backgroundColor: '#000000', borderRadius: '50%', margin: '3px 0' }} />}
        Profile
      </button>
    </div>
  );
}