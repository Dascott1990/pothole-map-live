import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { api } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapUpdater = ({ reports }) => {
  const map = useMap();
  
  useEffect(() => {
    if (reports.length > 0) {
      const group = new L.FeatureGroup(reports.map(report => 
        L.marker([report.lat, report.lon])
      ));
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [reports, map]);

  return null;
};

const PotholeMap = ({ selectedReport, onReportSelect }) => {
  const [reports, setReports] = useState([]);
  const [position, setPosition] = useState([51.505, -0.09]); // Default London
  const { reports: socketReports } = useSocket();

  useEffect(() => {
    fetchReports();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (socketReports.length > 0) {
      setReports(prev => {
        const newReports = socketReports.filter(sr => 
          !prev.find(p => p.id === sr.id)
        );
        return [...prev, ...newReports];
      });
    }
  }, [socketReports]);

  const fetchReports = async () => {
    try {
      const response = await api.get('/api/reports?limit=100');
      setReports(response.data.reports);
    } catch (error) {
      console.error('Failed to fetch reports for map:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          console.log('Geolocation failed, using default position');
        }
      );
    }
  };

  const getMarkerColor = (severity) => {
    const colors = {
      low: 'green',
      medium: 'orange',
      high: 'red'
    };
    return colors[severity] || 'gray';
  };

  const createCustomIcon = (severity) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${getMarkerColor(severity)};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const getSeverityBadge = (severity) => {
    const severityStyles = {
      low: 'bg-success',
      medium: 'bg-warning',
      high: 'bg-danger'
    };
    return severityStyles[severity] || 'bg-secondary';
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater reports={reports} />
        
        {reports.map(report => (
          <Marker
            key={report.id}
            position={[report.lat, report.lon]}
            icon={createCustomIcon(report.severity)}
            eventHandlers={{
              click: () => onReportSelect && onReportSelect(report),
            }}
          >
            <Popup>
              <div>
                <h6>Pothole Report</h6>
                <p>{report.text && report.text.substring(0, 100)}...</p>
                <span className={`badge ${getSeverityBadge(report.severity)}`}>
                  {report.severity && report.severity.toUpperCase()}
                </span>
                {report.verified && (
                  <span className="badge bg-success ms-1">Verified</span>
                )}
                <br />
                <small className="text-muted">
                  by {report.username}
                </small>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PotholeMap;