import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Database,
  Shield,
  Bell,
  Monitor,
  Server
} from 'lucide-react';

const SettingsContainer = styled.div`
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

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
`;

const SettingsCard = styled.div`
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f3f4f6;
`;

const CardIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color};
  color: white;
`;

const CardTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Switch = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 12px;
`;

const SwitchInput = styled.input`
  display: none;
`;

const SwitchSlider = styled.div`
  position: relative;
  width: 50px;
  height: 24px;
  background: ${props => props.checked ? '#3b82f6' : '#d1d5db'};
  border-radius: 12px;
  transition: all 0.3s ease;

  &:before {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.checked ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
`;

const SwitchText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 25px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &.primary {
    background: #3b82f6;
    color: white;

    &:hover {
      background: #2563eb;
    }
  }

  &.secondary {
    background: #f3f4f6;
    color: #374151;

    &:hover {
      background: #e5e7eb;
    }
  }

  &.danger {
    background: #ef4444;
    color: white;

    &:hover {
      background: #dc2626;
    }
  }
`;

const InfoText = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 5px 0 0 0;
`;

const StatusIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.status === 'connected' ? '#dcfce7' : '#fef2f2'};
  color: ${props => props.status === 'connected' ? '#166534' : '#dc2626'};
  border: 1px solid ${props => props.status === 'connected' ? '#bbf7d0' : '#fecaca'};
`;

function Settings() {
  const [settings, setSettings] = useState({
    // Database settings
    influxdbUrl: 'http://localhost:8086',
    influxdbToken: 'water_monitoring_token_2024',
    influxdbOrg: 'water_treatment',
    influxdbBucket: 'water_metrics',
    
    // Alert settings
    alertEmail: 'admin@watermonitor.com',
    alertPhone: '+1-555-0123',
    highPriorityThreshold: 0.8,
    mediumPriorityThreshold: 0.6,
    
    // Monitoring settings
    dataCollectionInterval: 30,
    retentionPeriod: 90,
    backupFrequency: 24,
    
    // System settings
    autoRestart: true,
    logLevel: 'info',
    maintenanceMode: false
  });

  const [testStatus, setTestStatus] = useState({
    influxdb: 'connected',
    email: 'connected',
    backup: 'connected'
  });

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log('Saving settings:', settings);
    // Show success message
  };

  const handleTestConnection = (type) => {
    // In a real app, this would test the actual connection
    console.log('Testing connection:', type);
    // Simulate test
    setTimeout(() => {
      setTestStatus(prev => ({
        ...prev,
        [type]: Math.random() > 0.5 ? 'connected' : 'disconnected'
      }));
    }, 1000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      // Reset to default values
      setSettings({
        influxdbUrl: 'http://localhost:8086',
        influxdbToken: 'water_monitoring_token_2024',
        influxdbOrg: 'water_treatment',
        influxdbBucket: 'water_metrics',
        alertEmail: 'admin@watermonitor.com',
        alertPhone: '+1-555-0123',
        highPriorityThreshold: 0.8,
        mediumPriorityThreshold: 0.6,
        dataCollectionInterval: 30,
        retentionPeriod: 90,
        backupFrequency: 24,
        autoRestart: true,
        logLevel: 'info',
        maintenanceMode: false
      });
    }
  };

  return (
    <SettingsContainer>
      <Header>
        <Title>
          <SettingsIcon size={32} color="#6b7280" />
          System Settings
        </Title>
      </Header>

      <SettingsGrid>
        {/* Database Settings */}
        <SettingsCard>
          <CardHeader>
            <CardIcon color="#3b82f6">
              <Database size={24} />
            </CardIcon>
            <CardTitle>Database Configuration</CardTitle>
          </CardHeader>

          <FormGroup>
            <Label>InfluxDB URL</Label>
            <Input
              type="url"
              value={settings.influxdbUrl}
              onChange={(e) => handleInputChange('influxdbUrl', e.target.value)}
              placeholder="http://localhost:8086"
            />
          </FormGroup>

          <FormGroup>
            <Label>Organization</Label>
            <Input
              type="text"
              value={settings.influxdbOrg}
              onChange={(e) => handleInputChange('influxdbOrg', e.target.value)}
              placeholder="water_treatment"
            />
          </FormGroup>

          <FormGroup>
            <Label>Bucket</Label>
            <Input
              type="text"
              value={settings.influxdbBucket}
              onChange={(e) => handleInputChange('influxdbBucket', e.target.value)}
              placeholder="water_metrics"
            />
          </FormGroup>

          <FormGroup>
            <Label>API Token</Label>
            <Input
              type="password"
              value={settings.influxdbToken}
              onChange={(e) => handleInputChange('influxdbToken', e.target.value)}
              placeholder="Enter API token"
            />
            <InfoText>Keep this token secure and don't share it</InfoText>
          </FormGroup>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <StatusIndicator status={testStatus.influxdb}>
              {testStatus.influxdb === 'connected' ? 'Connected' : 'Disconnected'}
            </StatusIndicator>
            <Button 
              className="secondary" 
              onClick={() => handleTestConnection('influxdb')}
            >
              <RefreshCw size={16} />
              Test Connection
            </Button>
          </div>
        </SettingsCard>

        {/* Alert Settings */}
        <SettingsCard>
          <CardHeader>
            <CardIcon color="#ef4444">
              <Bell size={24} />
            </CardIcon>
            <CardTitle>Alert Configuration</CardTitle>
          </CardHeader>

          <FormGroup>
            <Label>Alert Email</Label>
            <Input
              type="email"
              value={settings.alertEmail}
              onChange={(e) => handleInputChange('alertEmail', e.target.value)}
              placeholder="admin@watermonitor.com"
            />
          </FormGroup>

          <FormGroup>
            <Label>Alert Phone</Label>
            <Input
              type="tel"
              value={settings.alertPhone}
              onChange={(e) => handleInputChange('alertPhone', e.target.value)}
              placeholder="+1-555-0123"
            />
          </FormGroup>

          <FormGroup>
            <Label>High Priority Threshold</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={settings.highPriorityThreshold}
              onChange={(e) => handleInputChange('highPriorityThreshold', parseFloat(e.target.value))}
            />
            <InfoText>Threshold for high priority alerts (0.0 - 1.0)</InfoText>
          </FormGroup>

          <FormGroup>
            <Label>Medium Priority Threshold</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={settings.mediumPriorityThreshold}
              onChange={(e) => handleInputChange('mediumPriorityThreshold', parseFloat(e.target.value))}
            />
            <InfoText>Threshold for medium priority alerts (0.0 - 1.0)</InfoText>
          </FormGroup>
        </SettingsCard>

        {/* Monitoring Settings */}
        <SettingsCard>
          <CardHeader>
            <CardIcon color="#10b981">
              <Monitor size={24} />
            </CardIcon>
            <CardTitle>Monitoring Configuration</CardTitle>
          </CardHeader>

          <FormGroup>
            <Label>Data Collection Interval (seconds)</Label>
            <Input
              type="number"
              min="10"
              max="300"
              value={settings.dataCollectionInterval}
              onChange={(e) => handleInputChange('dataCollectionInterval', parseInt(e.target.value))}
            />
            <InfoText>How often to collect sensor data (10-300 seconds)</InfoText>
          </FormGroup>

          <FormGroup>
            <Label>Data Retention Period (days)</Label>
            <Input
              type="number"
              min="30"
              max="365"
              value={settings.retentionPeriod}
              onChange={(e) => handleInputChange('retentionPeriod', parseInt(e.target.value))}
            />
            <InfoText>How long to keep historical data (30-365 days)</InfoText>
          </FormGroup>

          <FormGroup>
            <Label>Backup Frequency (hours)</Label>
            <Input
              type="number"
              min="1"
              max="168"
              value={settings.backupFrequency}
              onChange={(e) => handleInputChange('backupFrequency', parseInt(e.target.value))}
            />
            <InfoText>How often to create system backups (1-168 hours)</InfoText>
          </FormGroup>

          <FormGroup>
            <Label>Log Level</Label>
            <Select
              value={settings.logLevel}
              onChange={(e) => handleInputChange('logLevel', e.target.value)}
            >
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </Select>
          </FormGroup>
        </SettingsCard>

        {/* System Settings */}
        <SettingsCard>
          <CardHeader>
            <CardIcon color="#8b5cf6">
              <Server size={24} />
            </CardIcon>
            <CardTitle>System Configuration</CardTitle>
          </CardHeader>

          <FormGroup>
            <Switch>
              <SwitchInput
                type="checkbox"
                checked={settings.autoRestart}
                onChange={(e) => handleInputChange('autoRestart', e.target.checked)}
              />
              <SwitchSlider checked={settings.autoRestart} />
              <SwitchText>Auto-restart on failure</SwitchText>
            </Switch>
          </FormGroup>

          <FormGroup>
            <Switch>
              <SwitchInput
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
              />
              <SwitchSlider checked={settings.maintenanceMode} />
              <SwitchText>Maintenance mode</SwitchText>
            </Switch>
            <InfoText>When enabled, system will show maintenance page</InfoText>
          </FormGroup>

          <FormGroup>
            <Label>System Description</Label>
            <Textarea
              placeholder="Enter system description..."
              value="Multi-host water monitoring infrastructure with distributed sensors and centralized dashboard"
              readOnly
            />
            <InfoText>System description for documentation purposes</InfoText>
          </FormGroup>
        </SettingsCard>
      </SettingsGrid>

      <ButtonGroup>
        <Button className="primary" onClick={handleSave}>
          <Save size={16} />
          Save Settings
        </Button>
        <Button className="secondary" onClick={handleReset}>
          <RefreshCw size={16} />
          Reset to Default
        </Button>
      </ButtonGroup>
    </SettingsContainer>
  );
}

export default Settings;
