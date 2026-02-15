
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useHiveStore } from './state/hive';
import { Button, Paper, Checkbox, FormControlLabel, Typography, IconButton, Alert } from '@mui/material';
// Hilfsfunktion: JSON zu CSV
function jsonToCsv(data) {
  if (!data || !data.length) return '';
  const replacer = (key, value) => (value === null ? '' : value);
  const header = Object.keys(data[0]);
  return [
    header.join(','),
    ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
  ].join('\r\n');
}

function downloadCsv(data, filename = 'standorte.csv') {
  const csv = jsonToCsv(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
import CloseIcon from '@mui/icons-material/Close';
import { FaBrain } from 'react-icons/fa';
import Modal from 'react-modal';

import { MapContainer, TileLayer } from 'react-leaflet';
import { LocationMarkers } from './components/LocationMarkers';
import { HeatmapOverlay } from './components/HeatmapOverlay';
import { LocationConnections } from './components/LocationConnections';
import { StationMarkers } from './components/StationMarkers';

import 'leaflet/dist/leaflet.css';
import './App.css';


Modal.setAppElement('#root');

function App() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const showConnections = useHiveStore(s => s.showConnections);
  const setShowConnections = useHiveStore(s => s.setShowConnections);
  const showRailLayer = useHiveStore(s => s.showRailLayer);
  const setShowRailLayer = useHiveStore(s => s.setShowRailLayer);
  const selectedLocation = useHiveStore(s => s.selectedLocation);
  const setSelectedLocation = useHiveStore(s => s.setSelectedLocation);
  // Filter/Search state
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // Dynamische Standortdaten
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [locationsError, setLocationsError] = useState(null);
  // Heatmap
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    setLoadingLocations(true);
    axios.get('./src/data/locations.json')
      .then(res => {
        setLocations(res.data);
        setLoadingLocations(false);
      })
      .catch(err => {
        setLocationsError('Fehler beim Laden der Standorte');
        setLoadingLocations(false);
      });
  }, []);

  // Panel für Standortsteuerung
  function renderControlPanel() {
    if (!selectedLocation) {
      return <Typography color="text.secondary" fontStyle="italic">Wähle einen Standort auf der Karte…</Typography>;
    }
    // Authentische Werte für ein Kraftwerk
    const fakeData = selectedLocation.type === 'power' ? {
      leistung: '1200 MW',
      temperatur: '320 °C',
      druck: '155 bar',
      status: selectedLocation.status === 'active' ? 'Online' : (selectedLocation.status === 'critical' ? 'Warnung' : 'Offline'),
      letzteWartung: '12.01.2026',
    } : null;
    return (
      <Paper elevation={0} sx={{ p: 2, mb: 2, position: 'relative' }}>
        <IconButton size="small" onClick={() => setSelectedLocation(null)} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
        <Typography variant="h6" color="primary" sx={{ mb: 1 }}>{selectedLocation.name}</Typography>
        <Typography color="text.secondary">Status: <b style={{ color: '#2a4a7b' }}>{selectedLocation.status}</b></Typography>
        <Typography sx={{ my: 1 }}>{selectedLocation.description}</Typography>
        {fakeData && (
          <>
            <Typography variant="body2" sx={{ mt: 2, mb: 0.5 }}>Leistung: <b>{fakeData.leistung}</b></Typography>
            <Typography variant="body2">Temperatur: <b>{fakeData.temperatur}</b></Typography>
            <Typography variant="body2">Druck: <b>{fakeData.druck}</b></Typography>
            <Typography variant="body2">Status: <b style={{ color: '#2a4a7b' }}>{fakeData.status}</b></Typography>
            <Typography variant="body2">Letzte Wartung: <b>{fakeData.letzteWartung}</b></Typography>
          </>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <Button variant="contained" size="small" color="primary" onClick={() => alert('KraftwerkControl wird geöffnet...')}>In KraftwerkControl öffnen</Button>
        </div>
      </Paper>
    );
  }

  // Platzhalter für andere Module
  // Nur Karte und Steuerungspanel
  function renderMainContent() {
    return (
      <div style={{ display: 'flex', gap: 32, height: '70vh', minHeight: 500, width: '100%' }}>
        <div className="map-wrapper" style={{ flex: 2.5, height: '100%', minWidth: 0 }}>
          {/* Filter & Suche UI */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: 4, borderRadius: 4, border: '1px solid #b0b7c3' }}>
              <option value="">Alle Typen</option>
              <option value="power">Kraftwerke</option>
              <option value="airport">Flughäfen</option>
              <option value="server">Rechenzentren</option>
              <option value="gov">Behörden</option>
              <option value="water">Wasserwerke</option>
              <option value="base">Militärbasen</option>
              <option value="hospital">Krankenhäuser</option>
              <option value="fire">Feuerwachen</option>
              <option value="police">Polizei</option>
              <option value="school">Schulen</option>
              <option value="cityhall">Rathäuser</option>
              <option value="bridge">Brücken</option>
              <option value="port">Häfen</option>
              <option value="energy">Umspannwerke</option>
              <option value="metro">U-Bahn</option>
              <option value="university">Universitäten</option>
              <option value="control">Leitstellen</option>
            </select>
            <input
              type="text"
              placeholder="Suche nach Name oder Ort..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: 4, borderRadius: 4, border: '1px solid #b0b7c3', flex: 1 }}
            />
          </div>
          {loadingLocations ? (
            <div style={{ padding: 16 }}>Lade Standorte…</div>
          ) : locationsError ? (
            <div style={{ color: 'red', padding: 16 }}>{locationsError}</div>
          ) : (
            <MapContainer
              center={[20, 0]}
              zoom={2}
              minZoom={2}
              maxZoom={8}
              style={{ height: '100%', width: '100%', borderRadius: '8px' }}
              scrollWheelZoom={true}
              zoomControl={true}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {showRailLayer && (
                <TileLayer
                  url="https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
                  opacity={0.7}
                  attribution="&copy; OpenRailwayMap contributors"
                />
              )}
              {showConnections && <LocationConnections locations={locations} />}
              {showHeatmap && (
                <HeatmapOverlay
                  points={locations.map(l => ({
                    position: l.position,
                    intensity: l.status === 'critical' ? 1 : 0.3
                  }))}
                />
              )}
              <LocationMarkers onSelect={setSelectedLocation} typeFilter={typeFilter} searchTerm={searchTerm} locations={locations} />
              <StationMarkers />
            </MapContainer>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 260, background: '#f4f6fa', border: '1px solid #b0b7c3', borderRadius: 8, padding: 16, height: '100%' }}>
          {renderControlPanel()}
          <FormControlLabel
            control={<Checkbox checked={showConnections} onChange={e => setShowConnections(e.target.checked)} color="primary" />}
            label={<Typography color="primary">Verbindungen anzeigen</Typography>}
            sx={{ mt: 3 }}
          />
          <FormControlLabel
            control={<Checkbox checked={showRailLayer} onChange={e => setShowRailLayer(e.target.checked)} color="primary" />}
            label={<Typography color="primary">Schienennetz anzeigen</Typography>}
            sx={{ mt: 1 }}
          />
          <FormControlLabel
            control={<Checkbox checked={showHeatmap} onChange={e => setShowHeatmap(e.target.checked)} color="primary" />}
            label={<Typography color="primary">Heatmap anzeigen</Typography>}
            sx={{ mt: 1 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="hive-mind-app">
      <div className="icon-container" onClick={() => setModalIsOpen(true)} title="Open Hive Mind">
        <FaBrain size={60} color="#2a4a7b" />
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="hive-mind-modal"
        overlayClassName="hive-mind-overlay"
        contentLabel="Hive Mind Modal"
      >
        <div className="modal-header">
          <h2>Hive Mind</h2>
          <button className="close-btn" onClick={() => setModalIsOpen(false)}>&times;</button>
        </div>
        {/* Alarm-Benachrichtigungssystem */}
        {Array.isArray(locations) && locations.some(l => l.status === 'critical') && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Kritische Warnung: Mindestens ein Standort befindet sich im Status <b>Kritisch</b>!
          </Alert>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <Button variant="outlined" size="small" onClick={() => downloadCsv(locations)}>
            Standorte als CSV exportieren
          </Button>
        </div>
        <div className="modal-content">
          {renderMainContent()}
        </div>
      </Modal>
    </div>
  );
}

export default App
