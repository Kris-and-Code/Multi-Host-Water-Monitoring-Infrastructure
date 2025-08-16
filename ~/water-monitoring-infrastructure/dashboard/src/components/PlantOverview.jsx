import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { 
  Droplets, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  Thermometer,
  Gauge,
  Zap,
  Clock,
  MapPin
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const PlantContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const PlantHeader = styled.div`
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const PlantTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const PlantLocation = styled.p`
  color: #6b7280;
  font-size: 16px;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PlantStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const PlantStat = styled.div`
  text-align: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
`;

const MetricsCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
`;

const StatusIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  background: ${props => props.status === 'online' ? '#dcfce7' : '#fef2f2'};
  color: ${props => props.status === 'online' ? '#166534' : '#dc2626'};
  border: 1px solid ${props => props.status === 'online' ? '#bbf7d0' : '#fecaca'};
`;

const AlertSection = styled.div`
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const AlertItem = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 10px;
  background: ${props => props.severity === 'high' ? '#fef2f2' : props.severity === 'medium' ? '#fffbeb' : '#f0f9ff'};
  border-left: 4px solid ${props => props.severity === 'high' ? '#ef4444' : props.severity === 'medium' ? '#f59e0b' : '#3b82f6'};
`;

// Mock data for demonstration
const getPlantData = (plantId) => {
  const baseData = {
    1: {
      name: 'Treatment Plant A',
      location: 'North District',
      status: 'online',
      uptime: '99.2%',
      lastMaintenance: '2024-01-15',
      flowRate: 850,
      phLevel: 7.1,
      temperature: 22.3,
      pressure: 2.9,
      turbidity: 0.6,
      chlorine: 1.1,
      chartData: [
        { time: '00:00', flow: 800, ph: 7.0, temp: 22.0, pressure: 2.8 },
        { time: '04:00', flow: 850, ph: 7.1, temp: 22.2, pressure: 2.9 },
        { time: '08:00', flow: 900, ph: 7.2, temp: 22.5, pressure: 3.0 },
        { time: '12:00', flow: 880, ph: 7.1, temp: 22.8, pressure: 2.9 },
        { time: '16:00', flow: 920, ph: 7.3, temp: 23.0, pressure: 3.1 },
        { time: '20:00', flow: 850, ph: 7.1, temp: 22.3, pressure: 2.9 }
      ],
      alerts: [
        {
          id: 1,
          title: 'Flow Rate Variation',
          description: 'Flow rate exceeded normal range by 8%',
          severity: 'low',
          time: '1 hour ago'
        }
      ]
    },
    2: {
      name: 'Treatment Plant B',
      location: 'South District',
      status: 'online',
      uptime: '98.8%',
      lastMaintenance: '2024-01-10',
      flowRate: 720,
      phLevel: 7.3,
      temperature: 21.8,
      pressure: 2.6,
      turbidity: 0.9,
      chlorine: 1.3,
      chartData: [
        { time: '00:00', flow: 700, ph: 7.2, temp: 21.5, pressure: 2.5 },
        { time: '04:00', flow: 720, ph: 7.3, temp: 21.8, pressure: 2.6 },
        { time: '08:00', flow: 750, ph: 7.4, temp: 22.0, pressure: 2.7 },
        { time: '12:00', flow: 730, ph: 7.3, temp: 22.2, pressure: 2.6 },
        { time: '16:00', flow: 760, ph: 7.5, temp: 22.5, pressure: 2.8 },
        { time: '20:00', flow: 720, ph: 7.3, temp: 21.8, pressure: 2.6 }
      ],
      alerts: [
        {
          id: 1,
          title: 'High Turbidity Alert',
          description: 'Turbidity levels exceeded normal range',
          severity: 'medium',
          time: '2 hours ago'
        }
      ]
    }
  };

  return baseData[plantId] || baseData[1];
};

function PlantOverview() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery(['plantData', id], () => {
    return new Promise(resolve => setTimeout(() => resolve(getPlantData(parseInt(id))), 1000));
  });

  if (isLoading) return <div>Loading plant data...</div>;
  if (error) return <div>Error loading plant data</div>;

  return (
    <PlantContainer>
      <PlantHeader>
        <PlantTitle>
          <Droplets size={32} color="#3b82f6" />
          {data.name}
        </PlantTitle>
        <PlantLocation>
          <MapPin size={16} />
          {data.location}
        </PlantLocation>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          <StatusIndicator status={data.status}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: data.status === 'online' ? '#16a34a' : '#dc2626' }}></div>
            {data.status === 'online' ? 'Online' : 'Offline'}
          </StatusIndicator>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
            <Clock size={16} />
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        <PlantStats>
          <PlantStat>
            <StatNumber>{data.flowRate}</StatNumber>
            <StatLabel>Flow Rate (L/min)</StatLabel>
          </PlantStat>
          <PlantStat>
            <StatNumber>{data.phLevel}</StatNumber>
            <StatLabel>pH Level</StatLabel>
          </PlantStat>
          <PlantStat>
            <StatNumber>{data.temperature}°C</StatNumber>
            <StatLabel>Temperature</StatLabel>
          </PlantStat>
          <PlantStat>
            <StatNumber>{data.pressure}</StatNumber>
            <StatLabel>Pressure (bar)</StatLabel>
          </PlantStat>
          <PlantStat>
            <StatNumber>{data.turbidity}</StatNumber>
            <StatLabel>Turbidity (NTU)</StatLabel>
          </PlantStat>
          <PlantStat>
            <StatNumber>{data.chlorine}</StatNumber>
            <StatLabel>Chlorine (mg/L)</StatLabel>
          </PlantStat>
        </PlantStats>
      </PlantHeader>

      <MetricsGrid>
        <MetricsCard>
          <CardTitle>Real-time Metrics</CardTitle>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="flow" stroke="#3b82f6" strokeWidth={2} name="Flow Rate" />
              <Line type="monotone" dataKey="ph" stroke="#10b981" strokeWidth={2} name="pH Level" />
              <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} name="Temperature" />
              <Line type="monotone" dataKey="pressure" stroke="#8b5cf6" strokeWidth={2} name="Pressure" />
            </LineChart>
          </ResponsiveContainer>
        </MetricsCard>

        <MetricsCard>
          <CardTitle>Plant Information</CardTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Uptime</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{data.uptime}</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Last Maintenance</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{data.lastMaintenance}</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Status</div>
              <StatusIndicator status={data.status}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: data.status === 'online' ? '#16a34a' : '#dc2626' }}></div>
                {data.status === 'online' ? 'Operational' : 'Maintenance'}
              </StatusIndicator>
            </div>
          </div>
        </MetricsCard>
      </MetricsGrid>

      <AlertSection>
        <CardTitle>Plant Alerts</CardTitle>
        {data.alerts.length > 0 ? (
          data.alerts.map(alert => (
            <AlertItem key={alert.id} severity={alert.severity}>
              <AlertTriangle size={20} style={{ marginRight: '15px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: '5px' }}>{alert.title}</div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>{alert.description}</div>
              </div>
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>{alert.time}</div>
            </AlertItem>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>✓</div>
            <div>No active alerts</div>
          </div>
        )}
      </AlertSection>
    </PlantContainer>
  );
}

export default PlantOverview;
