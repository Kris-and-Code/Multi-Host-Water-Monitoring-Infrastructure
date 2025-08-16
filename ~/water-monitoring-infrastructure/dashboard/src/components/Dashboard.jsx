import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { 
  Droplets, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  Thermometer,
  Gauge,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const LastUpdated = styled.p`
  color: #6b7280;
  font-size: 14px;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  background: ${props => props.color};
  color: white;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.p`
  color: #6b7280;
  font-size: 14px;
  margin: 0;
  font-weight: 500;
`;

const StatValue = styled.h3`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 5px 0 0 0;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  font-weight: 500;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
`;

const ChartCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
`;

const AlertsSection = styled.div`
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

const AlertIcon = styled.div`
  margin-right: 15px;
  color: ${props => props.severity === 'high' ? '#ef4444' : props.severity === 'medium' ? '#f59e0b' : '#3b82f6'};
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 5px 0;
`;

const AlertDescription = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0;
`;

const AlertTime = styled.span`
  font-size: 12px;
  color: #9ca3af;
`;

// Mock data for demonstration
const mockData = {
  stats: {
    totalFlow: 1250,
    phLevel: 7.2,
    temperature: 22.5,
    pressure: 2.8,
    turbidity: 0.8,
    chlorine: 1.2
  },
  chartData: [
    { time: '00:00', flow: 1200, ph: 7.1, temp: 22.0 },
    { time: '04:00', flow: 1250, ph: 7.2, temp: 22.2 },
    { time: '08:00', flow: 1300, ph: 7.3, temp: 22.5 },
    { time: '12:00', flow: 1280, ph: 7.2, temp: 22.8 },
    { time: '16:00', flow: 1320, ph: 7.4, temp: 23.0 },
    { time: '20:00', flow: 1250, ph: 7.2, temp: 22.5 }
  ],
  alerts: [
    {
      id: 1,
      title: 'High Turbidity Alert',
      description: 'Turbidity levels exceeded normal range at Plant A',
      severity: 'medium',
      time: '2 hours ago'
    },
    {
      id: 2,
      title: 'Pressure Fluctuation',
      description: 'Unusual pressure variations detected in main line',
      severity: 'low',
      time: '4 hours ago'
    }
  ]
};

function Dashboard() {
  const { data, isLoading, error } = useQuery('dashboardData', () => {
    // In a real app, this would fetch from your API
    return new Promise(resolve => setTimeout(() => resolve(mockData), 1000));
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading dashboard</div>;

  return (
    <DashboardContainer>
      <Header>
        <Title>Water Monitoring Dashboard</Title>
        <LastUpdated>Last updated: {new Date().toLocaleTimeString()}</LastUpdated>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatIcon color="#3b82f6">
              <Droplets size={24} />
            </StatIcon>
            <StatInfo>
              <StatLabel>Total Flow Rate</StatLabel>
              <StatValue>{data.stats.totalFlow} L/min</StatValue>
            </StatInfo>
          </StatHeader>
          <StatChange positive>
            <TrendingUp size={16} />
            +2.5%
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#10b981">
              <Activity size={24} />
            </StatIcon>
            <StatInfo>
              <StatLabel>pH Level</StatLabel>
              <StatValue>{data.stats.phLevel}</StatValue>
            </StatInfo>
          </StatHeader>
          <StatChange positive>
            <TrendingUp size={16} />
            Normal
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#f59e0b">
              <Thermometer size={24} />
            </StatIcon>
            <StatInfo>
              <StatLabel>Temperature</StatLabel>
              <StatValue>{data.stats.temperature}°C</StatValue>
            </StatInfo>
          </StatHeader>
          <StatChange positive>
            <TrendingUp size={16} />
            Stable
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#8b5cf6">
              <Gauge size={24} />
            </StatIcon>
            <StatInfo>
              <StatLabel>Pressure</StatLabel>
              <StatValue>{data.stats.pressure} bar</StatValue>
            </StatInfo>
          </StatHeader>
          <StatChange positive>
            <TrendingUp size={16} />
            +0.1
          </StatChange>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>Water Quality Metrics Over Time</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="flow" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="ph" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>System Status</ChartTitle>
          <div style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', color: '#10b981' }}>✓</div>
              <div style={{ color: '#6b7280', marginTop: '10px' }}>All Systems Online</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#1f2937' }}>98.5%</div>
              <div style={{ color: '#6b7280' }}>Uptime</div>
            </div>
          </div>
        </ChartCard>
      </ChartsGrid>

      <AlertsSection>
        <ChartTitle>Recent Alerts</ChartTitle>
        {data.alerts.map(alert => (
          <AlertItem key={alert.id} severity={alert.severity}>
            <AlertIcon severity={alert.severity}>
              <AlertTriangle size={20} />
            </AlertIcon>
            <AlertContent>
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
            </AlertContent>
            <AlertTime>{alert.time}</AlertTime>
          </AlertItem>
        ))}
      </AlertsSection>
    </DashboardContainer>
  );
}

export default Dashboard;
