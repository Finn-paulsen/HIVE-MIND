import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseTerminal from '../BaseTerminal';
import AnalogGauge from '../controls/AnalogGauge';
import ToggleSwitch from '../controls/ToggleSwitch';
import PushButton from '../controls/PushButton';
import LEDIndicator from '../controls/LEDIndicator';
import DigitalDisplay from '../controls/DigitalDisplay';
import Slider from '../controls/Slider';
import StatusBoard from '../controls/StatusBoard';

export default function PowerPlantTerminal({ location, onClose }) {
  const [activeTab, setActiveTab] = useState('reactor');
  
  // Reactor state
  const [coreTemp, setCoreTemp] = useState(320);
  const [controlRodPosition, setControlRodPosition] = useState(65);
  const [neutronFlux, setNeutronFlux] = useState(75);
  const [coolantPressure, setCoolantPressure] = useState(155);
  const [radiationLevel, setRadiationLevel] = useState(0.5);
  
  // Turbine state
  const [turbineRPM, setTurbineRPM] = useState(3000);
  const [steamPressure, setSteamPressure] = useState(180);
  const [generatorFreq, setGeneratorFreq] = useState(50.0);
  const [vibrationLevel, setVibrationLevel] = useState(2.5);
  
  // Grid state
  const [powerOutput, setPowerOutput] = useState(1200);
  const [gridVoltage, setGridVoltage] = useState(400);
  const [circuitBreakers, setCircuitBreakers] = useState({
    main: true,
    backup: false,
    grid1: true,
    grid2: true,
    grid3: false
  });
  
  // Emergency state
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [backupGenerator, setBackupGenerator] = useState(false);
  const [fireSuppressionArmed, setFireSuppressionArmed] = useState(true);

  // Simulate realistic data changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!emergencyMode) {
        // Normal operation variations
        setCoreTemp(prev => prev + (Math.random() - 0.5) * 2);
        setNeutronFlux(prev => Math.max(60, Math.min(90, prev + (Math.random() - 0.5) * 3)));
        setCoolantPressure(prev => prev + (Math.random() - 0.5) * 1);
        setRadiationLevel(prev => Math.max(0, prev + (Math.random() - 0.5) * 0.1));
        
        setTurbineRPM(prev => prev + (Math.random() - 0.5) * 10);
        setSteamPressure(prev => prev + (Math.random() - 0.5) * 2);
        setGeneratorFreq(49.9 + Math.random() * 0.2);
        setVibrationLevel(2 + Math.random() * 1);
        
        setPowerOutput(prev => prev + (Math.random() - 0.5) * 20);
        setGridVoltage(395 + Math.random() * 10);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [emergencyMode]);

  // Control rod position directly affects temperature and flux
  useEffect(() => {
    const newTemp = emergencyMode ? 100 : 250 + (controlRodPosition * 10);
    const newFlux = emergencyMode ? 0 : controlRodPosition * 1.2;
    
    // Only update if values changed significantly
    if (Math.abs(coreTemp - newTemp) > 0.1) {
      setCoreTemp(newTemp);
    }
    if (Math.abs(neutronFlux - newFlux) > 0.1) {
      setNeutronFlux(newFlux);
    }
  }, [controlRodPosition, emergencyMode, coreTemp, neutronFlux]);

  const tabs = [
    { id: 'reactor', label: 'Reaktorkern' },
    { id: 'turbine', label: 'Turbinenhalle' },
    { id: 'grid', label: 'Stromnetz' },
    { id: 'emergency', label: 'Notfall' }
  ];

  const handleEmergencyShutdown = () => {
    setEmergencyMode(true);
    setControlRodPosition(0);
    setCoreTemp(100);
    setPowerOutput(0);
    setCircuitBreakers({
      main: false,
      backup: false,
      grid1: false,
      grid2: false,
      grid3: false
    });
  };

  const handleCircuitBreakerToggle = (breaker) => {
    setCircuitBreakers(prev => ({
      ...prev,
      [breaker]: !prev[breaker]
    }));
  };

  const renderReactorControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={coreTemp}
        min={0}
        max={3000}
        unit="°C"
        label="Kerntemperatur"
        zones={[
          { max: 500, color: '#33ff33' },
          { max: 800, color: '#ffaa00' },
          { max: 3000, color: '#ff3333' }
        ]}
      />
      
      <AnalogGauge
        value={neutronFlux}
        min={0}
        max={100}
        unit="%"
        label="Neutronenfluss"
        zones={[
          { max: 80, color: '#33ff33' },
          { max: 95, color: '#ffaa00' },
          { max: 100, color: '#ff3333' }
        ]}
      />
      
      <AnalogGauge
        value={coolantPressure}
        min={0}
        max={200}
        unit="bar"
        label="Kühlmitteldruck"
        zones={[
          { max: 170, color: '#33ff33' },
          { max: 185, color: '#ffaa00' },
          { max: 200, color: '#ff3333' }
        ]}
      />
      
      <DigitalDisplay
        label="Strahlungslevel"
        value={radiationLevel.toFixed(2) + ' mSv/h'}
        color={radiationLevel > 1 ? 'red' : 'green'}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Steuerstäbe</div>
        <Slider
          label="Position"
          value={controlRodPosition}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={setControlRodPosition}
          disabled={emergencyMode}
        />
        <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <LEDIndicator 
            label="Voll Eingefahren" 
            color={controlRodPosition < 10 ? 'green' : 'off'} 
          />
          <LEDIndicator 
            label="Normal" 
            color={controlRodPosition >= 10 && controlRodPosition <= 90 ? 'green' : 'off'} 
          />
          <LEDIndicator 
            label="Voll Ausgefahren" 
            color={controlRodPosition > 90 ? 'red' : 'off'} 
            pulse={controlRodPosition > 90}
          />
        </div>
      </div>
    </div>
  );

  const renderTurbineControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={turbineRPM}
        min={0}
        max={3600}
        unit="RPM"
        label="Turbinendrehzahl"
        zones={[
          { max: 3200, color: '#33ff33' },
          { max: 3500, color: '#ffaa00' },
          { max: 3600, color: '#ff3333' }
        ]}
      />
      
      <AnalogGauge
        value={steamPressure}
        min={0}
        max={250}
        unit="bar"
        label="Dampfdruck"
        zones={[
          { max: 200, color: '#33ff33' },
          { max: 230, color: '#ffaa00' },
          { max: 250, color: '#ff3333' }
        ]}
      />
      
      <DigitalDisplay
        label="Generator Frequenz"
        value={generatorFreq.toFixed(2) + ' Hz'}
        color="green"
      />
      
      <DigitalDisplay
        label="Vibrationslevel"
        value={vibrationLevel.toFixed(1) + ' mm/s'}
        color={vibrationLevel > 5 ? 'red' : 'green'}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Turbinen Status</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Turbine 1" color="green" />
          <LEDIndicator label="Turbine 2" color="green" />
          <LEDIndicator label="Turbine 3" color={powerOutput > 1000 ? 'green' : 'yellow'} />
        </div>
      </div>
    </div>
  );

  const renderGridControls = () => (
    <div className="terminal-grid-2col">
      <div>
        <AnalogGauge
          value={powerOutput}
          min={0}
          max={1500}
          unit="MW"
          label="Netzleistung"
          size={220}
          zones={[
            { max: 1200, color: '#33ff33' },
            { max: 1400, color: '#ffaa00' },
            { max: 1500, color: '#ff3333' }
          ]}
        />
        
        <DigitalDisplay
          label="Netzspannung"
          value={gridVoltage.toFixed(1) + ' kV'}
          color="blue"
        />
      </div>
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Leistungsschalter</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Hauptschalter"
            active={circuitBreakers.main}
            onChange={() => handleCircuitBreakerToggle('main')}
            disabled={emergencyMode}
          />
          <ToggleSwitch
            label="Backup"
            active={circuitBreakers.backup}
            onChange={() => handleCircuitBreakerToggle('backup')}
          />
          <ToggleSwitch
            label="Netz 1"
            active={circuitBreakers.grid1}
            onChange={() => handleCircuitBreakerToggle('grid1')}
          />
          <ToggleSwitch
            label="Netz 2"
            active={circuitBreakers.grid2}
            onChange={() => handleCircuitBreakerToggle('grid2')}
          />
          <ToggleSwitch
            label="Netz 3"
            active={circuitBreakers.grid3}
            onChange={() => handleCircuitBreakerToggle('grid3')}
          />
        </div>
      </div>
    </div>
  );

  const renderEmergencyControls = () => (
    <div className="terminal-grid">
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header" style={{ color: '#ff3333' }}>
          Notfallsysteme
        </div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 20 }}>
          <PushButton
            label="Notabschaltung"
            variant="danger"
            requireConfirm={true}
            confirmText="NOTABSCHALTUNG INITIIEREN?\n\nDies wird den Reaktor sofort herunterfahren!"
            onClick={handleEmergencyShutdown}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ToggleSwitch
              label="Notstromgenerator"
              active={backupGenerator}
              onChange={setBackupGenerator}
            />
            <ToggleSwitch
              label="Feuerlöschsystem"
              active={fireSuppressionArmed}
              onChange={setFireSuppressionArmed}
            />
          </div>
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Status Übersicht</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator 
            label="Reaktor OK" 
            color={coreTemp < 800 ? 'green' : 'red'} 
            pulse={coreTemp >= 800}
          />
          <LEDIndicator 
            label="Kühlung OK" 
            color={coolantPressure > 100 && coolantPressure < 185 ? 'green' : 'red'} 
            pulse={coolantPressure >= 185}
          />
          <LEDIndicator 
            label="Turbinen OK" 
            color={turbineRPM > 2500 && turbineRPM < 3500 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Netz OK" 
            color={circuitBreakers.main ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Notfall" 
            color={emergencyMode ? 'red' : 'off'} 
            pulse={emergencyMode}
          />
        </div>
      </div>
    </div>
  );

  return (
    <BaseTerminal
      title={`Kraftwerk: ${location.name}`}
      status={location.status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      {activeTab === 'reactor' && renderReactorControls()}
      {activeTab === 'turbine' && renderTurbineControls()}
      {activeTab === 'grid' && renderGridControls()}
      {activeTab === 'emergency' && renderEmergencyControls()}
    </BaseTerminal>
  );
}

PowerPlantTerminal.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};
