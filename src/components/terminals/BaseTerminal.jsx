import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './styles/Terminal.css';
import './styles/Animations.css';

export default function BaseTerminal({ 
  title = 'TERMINAL', 
  status = 'active',
  tabs = [], 
  activeTab, 
  onTabChange, 
  onClose,
  children
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPowerOn, setIsPowerOn] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Power-on animation
  useEffect(() => {
    setTimeout(() => setIsPowerOn(true), 50);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const getStatusClass = () => {
    switch (status) {
      case 'active': return 'terminal-status-active';
      case 'critical': return 'terminal-status-critical';
      case 'offline': return 'terminal-status-offline';
      default: return 'terminal-status-active';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'active': return 'AKTIV';
      case 'critical': return 'KRITISCH';
      case 'offline': return 'OFFLINE';
      default: return 'UNBEKANNT';
    }
  };

  return (
    <div className={`terminal-modal-content ${isPowerOn ? 'terminal-power-on' : ''}`}>
      {/* Header */}
      <div className="terminal-header">
        <h1 className="terminal-title">
          {title}
          <span className={`terminal-status-badge ${getStatusClass()}`}>
            {getStatusLabel()}
          </span>
        </h1>
        <div className="terminal-timestamp">
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Tabs */}
      {tabs.length > 0 && (
        <div className="terminal-tabs">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`terminal-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange?.(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>
      )}

      {/* Screen */}
      <div className="terminal-screen">
        <div className="terminal-screen-inner">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="terminal-footer">
        <div className="terminal-system-info">
          <span>HIVE-MIND v2.0</span>
          <span>|</span>
          <span>SECURE CONNECTION</span>
          <span>|</span>
          <span>ENCRYPTION: AES-256</span>
        </div>
        <button className="terminal-close-btn" onClick={onClose}>
          [ESC] SCHLIESSEN
        </button>
      </div>
    </div>
  );
}

BaseTerminal.propTypes = {
  title: PropTypes.string,
  status: PropTypes.oneOf(['active', 'critical', 'offline']),
  tabs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })),
  activeTab: PropTypes.string,
  onTabChange: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node
};
