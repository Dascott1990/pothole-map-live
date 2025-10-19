import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ReportList from '../components/ReportList';
import ImageUpload from '../components/ImageUpload';
import PotholeMap from '../components/PotholeMap';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [selectedReport, setSelectedReport] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const [detectionData, setDetectionData] = useState(null);

  const handleDetectionComplete = (data) => {
    setDetectionData(data);
  };

  return (
    <div className="container-fluid px-0">
      <div className="row g-0">
        {/* Map Section - Full width on mobile, 50% on desktop */}
        {showMap && (
          <div className="col-lg-6 d-none d-lg-block" style={{ height: 'calc(100vh - 76px)' }}>
            <PotholeMap 
              selectedReport={selectedReport}
              onReportSelect={setSelectedReport}
            />
          </div>
        )}

        {/* Content Section */}
        <div className={showMap ? "col-lg-6" : "col-12"}>
          <div className="container py-4">
            {/* Mobile Map Toggle */}
            <div className="d-lg-none mb-3">
              <button 
                className="btn btn-outline-primary w-100"
                onClick={() => setShowMap(!showMap)}
              >
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
            </div>

            {showMap && (
              <div className="d-lg-none mb-4" style={{ height: '400px' }}>
                <PotholeMap 
                  selectedReport={selectedReport}
                  onReportSelect={setSelectedReport}
                />
              </div>
            )}

            {/* Image Upload for authenticated users */}
            {isAuthenticated && (
              <div className="mb-4">
                <ImageUpload onDetectionComplete={handleDetectionComplete} />
              </div>
            )}

            {/* Reports List */}
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Recent Pothole Reports</h4>
                <span className="badge bg-primary">
                  Community Driven
                </span>
              </div>
              <ReportList onReportSelect={setSelectedReport} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;