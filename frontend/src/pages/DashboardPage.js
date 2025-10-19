import React from 'react';
import StatsDashboard from '../components/StatsDashboard';

const DashboardPage = () => {
  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Community Analytics Dashboard</h2>
            <span className="badge bg-primary fs-6">Live Data</span>
          </div>
          <StatsDashboard />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;