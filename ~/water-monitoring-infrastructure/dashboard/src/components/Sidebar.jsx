import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Home, 
  AlertTriangle, 
  Settings, 
  Droplets, 
  Activity,
  BarChart3,
  Shield
} from 'lucide-react';

const SidebarContainer = styled.nav`
  width: 280px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  margin: 10px;
  padding: 30px 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const LogoTitle = styled.h1`
  color: white;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const LogoSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 5px 0 0 0;
`;

const NavMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 10px;
`;

const NavLinkStyled = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 15px;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    transform: translateX(5px);
  }

  &.active {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    box-shadow: 0 4px 20px rgba(255, 255, 255, 0.1);
  }

  svg {
    margin-right: 15px;
    width: 20px;
    height: 20px;
  }
`;

const PlantSection = styled.div`
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const PlantTitle = styled.h3`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 15px;
  padding-left: 20px;
`;

const PlantLink = styled(NavLinkStyled)`
  font-size: 14px;
  padding: 12px 20px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.status === 'online' ? '#10b981' : '#ef4444'};
  margin-left: auto;
  box-shadow: 0 0 10px ${props => props.status === 'online' ? '#10b981' : '#ef4444'};
`;

function Sidebar() {
  const location = useLocation();

  return (
    <SidebarContainer>
      <Logo>
        <LogoTitle>Water Monitor</LogoTitle>
        <LogoSubtitle>Infrastructure Dashboard</LogoSubtitle>
      </Logo>

      <NavMenu>
        <NavItem>
          <NavLinkStyled to="/" end>
            <Home />
            Dashboard
          </NavLinkStyled>
        </NavItem>
        
        <NavItem>
          <NavLinkStyled to="/alerts">
            <AlertTriangle />
            Alerts
          </NavLinkStyled>
        </NavItem>

        <NavItem>
          <NavLinkStyled to="/settings">
            <Settings />
            Settings
          </NavLinkStyled>
        </NavItem>
      </NavMenu>

      <PlantSection>
        <PlantTitle>Treatment Plants</PlantTitle>
        
        <NavItem>
          <PlantLink to="/plant/1">
            <Droplets />
            Plant A
            <StatusIndicator status="online" />
          </PlantLink>
        </NavItem>
        
        <NavItem>
          <PlantLink to="/plant/2">
            <Droplets />
            Plant B
            <StatusIndicator status="online" />
          </PlantLink>
        </NavItem>
      </PlantSection>
    </SidebarContainer>
  );
}

export default Sidebar;
