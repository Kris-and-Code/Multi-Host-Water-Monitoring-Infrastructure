import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Clock, 
  Filter,
  Search,
  Bell,
  CheckCircle
} from 'lucide-react';

const AlertsContainer = styled.div`
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
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Controls = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 10px 15px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  width: 300px;
  background: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 12px;
  color: #9ca3af;
  width: 16px;
  height: 16px;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #9ca3af;
    background: #f9fafb;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.color || '#1f2937'};
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`;

const AlertsList = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const AlertItem = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;

  &:hover {
    background: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const AlertIcon = styled.div`
  margin-right: 20px;
  color: ${props => {
    switch (props.severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
`;

const AlertDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 8px 0;
`;

const AlertMeta = styled.div`
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #9ca3af;
`;

const AlertActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &.acknowledge {
    background: #dbeafe;
    color: #1d4ed8;

    &:hover {
      background: #bfdbfe;
    }
  }

  &.resolve {
    background: #dcfce7;
    color: #166534;

    &:hover {
      background: #bbf7d0;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
`;

// Mock data for demonstration
const mockAlerts = [
  {
    id: 1,
    title: 'High Turbidity Alert - Plant A',
    description: 'Turbidity levels exceeded normal range by 15%. Current reading: 1.2 NTU, Normal range: 0.1-0.8 NTU',
    severity: 'high',
    plant: 'Plant A',
    timestamp: '2024-01-20T10:30:00Z',
    status: 'active',
    acknowledged: false
  },
  {
    id: 2,
    title: 'Flow Rate Variation - Plant B',
    description: 'Flow rate exceeded normal range by 8%. Current reading: 780 L/min, Normal range: 700-750 L/min',
    severity: 'medium',
    plant: 'Plant B',
    timestamp: '2024-01-20T09:15:00Z',
    status: 'active',
    acknowledged: true
  },
  {
    id: 3,
    title: 'Pressure Fluctuation - Main Line',
    description: 'Unusual pressure variations detected in main distribution line. Variations: ±0.3 bar',
    severity: 'low',
    plant: 'Main System',
    timestamp: '2024-01-20T08:45:00Z',
    status: 'resolved',
    acknowledged: true
  },
  {
    id: 4,
    title: 'pH Level Warning - Plant A',
    description: 'pH level approaching upper limit. Current reading: 7.8, Normal range: 6.5-7.5',
    severity: 'medium',
    plant: 'Plant A',
    timestamp: '2024-01-20T07:20:00Z',
    status: 'active',
    acknowledged: false
  },
  {
    id: 5,
    title: 'Temperature Alert - Plant B',
    description: 'Water temperature below normal range. Current reading: 18.5°C, Normal range: 20-25°C',
    severity: 'low',
    plant: 'Plant B',
    timestamp: '2024-01-20T06:30:00Z',
    status: 'resolved',
    acknowledged: true
  }
];

const getSeverityIcon = (severity) => {
  switch (severity) {
    case 'high': return <AlertTriangle size={24} />;
    case 'medium': return <AlertCircle size={24} />;
    case 'low': return <Info size={24} />;
    default: return <Info size={24} />;
  }
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#3b82f6';
    default: return '#6b7280';
  }
};

function Alerts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAlerts = mockAlerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const stats = {
    total: mockAlerts.length,
    active: mockAlerts.filter(a => a.status === 'active').length,
    high: mockAlerts.filter(a => a.severity === 'high' && a.status === 'active').length,
    resolved: mockAlerts.filter(a => a.status === 'resolved').length
  };

  const handleAcknowledge = (alertId) => {
    // In a real app, this would update the backend
    console.log('Acknowledging alert:', alertId);
  };

  const handleResolve = (alertId) => {
    // In a real app, this would update the backend
    console.log('Resolving alert:', alertId);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <AlertsContainer>
      <Header>
        <Title>
          <Bell size={32} color="#ef4444" />
          System Alerts
        </Title>
        <Controls>
          <SearchBox>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <FilterButton onClick={() => setSeverityFilter(severityFilter === 'all' ? 'high' : 'all')}>
            <Filter size={16} />
            {severityFilter === 'all' ? 'All Severities' : severityFilter}
          </FilterButton>
        </Controls>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatNumber>{stats.total}</StatNumber>
          <StatLabel>Total Alerts</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber color="#ef4444">{stats.active}</StatNumber>
          <StatLabel>Active Alerts</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber color="#f59e0b">{stats.high}</StatNumber>
          <StatLabel>High Priority</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber color="#10b981">{stats.resolved}</StatNumber>
          <StatLabel>Resolved</StatLabel>
        </StatCard>
      </StatsGrid>

      <AlertsList>
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <AlertItem key={alert.id}>
              <AlertIcon severity={alert.severity}>
                {getSeverityIcon(alert.severity)}
              </AlertIcon>
              <AlertContent>
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.description}</AlertDescription>
                <AlertMeta>
                  <span>Plant: {alert.plant}</span>
                  <span>Severity: {alert.severity}</span>
                  <span>Status: {alert.status}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={12} />
                    {formatTimestamp(alert.timestamp)}
                  </span>
                </AlertMeta>
              </AlertContent>
              <AlertActions>
                {!alert.acknowledged && (
                  <ActionButton 
                    className="acknowledge"
                    onClick={() => handleAcknowledge(alert.id)}
                  >
                    Acknowledge
                  </ActionButton>
                )}
                {alert.status === 'active' && (
                  <ActionButton 
                    className="resolve"
                    onClick={() => handleResolve(alert.id)}
                  >
                    Resolve
                  </ActionButton>
                )}
                {alert.status === 'resolved' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981' }}>
                    <CheckCircle size={16} />
                    Resolved
                  </div>
                )}
              </AlertActions>
            </AlertItem>
          ))
        ) : (
          <EmptyState>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>✓</div>
            <div>No alerts found</div>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>
              {searchTerm || severityFilter !== 'all' || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'All systems are running smoothly'}
            </div>
          </EmptyState>
        )}
      </AlertsList>
    </AlertsContainer>
  );
}

export default Alerts;
