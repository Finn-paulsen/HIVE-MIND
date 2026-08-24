import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useHiveStore } from './state/hive';
import { Alert, Button, Checkbox, FormControlLabel, Typography } from '@mui/material';
import Modal from 'react-modal';
import AirportTerminal from './components/terminals/terminals/AirportTerminal';
import PowerPlantTerminal from './components/terminals/terminals/PowerPlantTerminal';
import HospitalTerminal from './components/terminals/terminals/HospitalTerminal';
import PoliceStationTerminal from './components/terminals/terminals/PoliceStationTerminal';
import MilitaryBaseTerminal from './components/terminals/terminals/MilitaryBaseTerminal';
import ServerFarmTerminal from './components/terminals/terminals/ServerFarmTerminal';
import WaterTreatmentTerminal from './components/terminals/terminals/WaterTreatmentTerminal';
import EnergyTerminal from './components/terminals/terminals/EnergyTerminal';
import GovernmentTerminal from './components/terminals/terminals/GovernmentTerminal';
import FireStationTerminal from './components/terminals/terminals/FireStationTerminal';
import PortTerminal from './components/terminals/terminals/PortTerminal';
import BridgeTerminal from './components/terminals/terminals/BridgeTerminal';
import MetroTerminal from './components/terminals/terminals/MetroTerminal';
import SchoolTerminal from './components/terminals/terminals/SchoolTerminal';
import UniversityTerminal from './components/terminals/terminals/UniversityTerminal';
import CityHallTerminal from './components/terminals/terminals/CityHallTerminal';
import ControlTerminal from './components/terminals/terminals/ControlTerminal';

const CATEGORY_TERMINAL_MAP = {
  airport: AirportTerminal,
  power: PowerPlantTerminal,
  hospital: HospitalTerminal,
  police: PoliceStationTerminal,
  military: MilitaryBaseTerminal,
  datacenter: ServerFarmTerminal,
  water: WaterTreatmentTerminal,
  energy: EnergyTerminal,
  government: GovernmentTerminal,
  fire: FireStationTerminal,
  port: PortTerminal,
  bridge: BridgeTerminal,
  metro: MetroTerminal,
  school: SchoolTerminal,
  university: UniversityTerminal,
  cityhall: CityHallTerminal,
  control: ControlTerminal,
};

function jsonToCsv(data) {
  if (!data || !data.length) return '';
  const replacer = (key, value) => (value === null ? '' : value);
  const header = Object.keys(data[0]);
  return [
    header.join(','),
    ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',')),
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

import { FaBrain } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { LocationMarkers } from './components/LocationMarkers';
import { HeatmapOverlay } from './components/HeatmapOverlay';
import { LocationConnections } from './components/LocationConnections';
import { StationMarkers } from './components/StationMarkers';
import { FilterPanel } from './components/FilterPanel';
import { AssetDrawer } from './assets/AssetDrawer';
import { SEED_ASSETS, normalizeLocation } from './data/assets';
import { LayerManager } from './map/LayerManager';
import { SearchBar } from './search/SearchBar';

import 'leaflet/dist/leaflet.css';
import './App.css';

Modal.setAppElement('#root');

const LAYER_CATEGORY_MAP = {
  airport: 'airports',
  rail: 'rail',
  metro: 'rail',
  bank: 'banks',
  energy: 'energy',
  datacenter: 'datacenters',
  power: 'power',
  water: 'water',
  hospital: 'hospital',
  police: 'police',
  military: 'military',
};

function getLocationLayerKey(location) {
  const normalized = normalizeLocation(location);
  return LAYER_CATEGORY_MAP[normalized.category] || null;
}

function isLayerEnabled(activeLayers, layerKey) {
  if (!layerKey) {
    return true;
  }

  return activeLayers instanceof Set ? activeLayers.has(layerKey) : Boolean(activeLayers?.[layerKey]);
}

function MapViewportController() {
  const map = useMap();
  const mapFocusTarget = useHiveStore(state => state.mapFocusTarget);
  const temporaryPin = useHiveStore(state => state.temporaryPin);

  useEffect(() => {
    if (!mapFocusTarget?.center) {
      return;
    }

    map.flyTo(mapFocusTarget.center, mapFocusTarget.zoom ?? Math.max(map.getZoom(), 7), {
      duration: 1.2,
    });
  }, [map, mapFocusTarget]);

  return temporaryPin ? (
    <CircleMarker center={temporaryPin.position} radius={8} pathOptions={{ color: '#CC0000', fillColor: '#CC0000', fillOpacity: 0.7 }}>
      <Popup>{temporaryPin.label}</Popup>
    </CircleMarker>
  ) : null;
}

function App() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const showConnections = useHiveStore(s => s.showConnections);
  const setShowConnections = useHiveStore(s => s.setShowConnections);
  const showRailLayer = useHiveStore(s => s.showRailLayer);
  const setShowRailLayer = useHiveStore(s => s.setShowRailLayer);
  const showEsriBoundaries = useHiveStore(s => s.showEsriBoundaries);
  const setShowEsriBoundaries = useHiveStore(s => s.setShowEsriBoundaries);
  const showEsriTransportation = useHiveStore(s => s.showEsriTransportation);
  const setShowEsriTransportation = useHiveStore(s => s.setShowEsriTransportation);
  const showEsriTopo = useHiveStore(s => s.showEsriTopo);
  const setShowEsriTopo = useHiveStore(s => s.setShowEsriTopo);
  const esriOverlayOpacity = useHiveStore(s => s.esriOverlayOpacity);
  const setEsriOverlayOpacity = useHiveStore(s => s.setEsriOverlayOpacity);
  const setSelectedLocation = useHiveStore(s => s.setSelectedLocation);
  const selectedAsset = useHiveStore(s => s.selectedAsset);
  const setSelectedAsset = useHiveStore(s => s.setSelectedAsset);
  const activeLayers = useHiveStore(s => s.activeLayers);
  const toggleLayer = useHiveStore(s => s.toggleLayer);
  const setMapFocusTarget = useHiveStore(s => s.setMapFocusTarget);
  const setTemporaryPin = useHiveStore(s => s.setTemporaryPin);

  const [filters, setFilters] = useState({
    types: [],
    statuses: [],
    countries: [],
    search: '',
  });
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [locationsError, setLocationsError] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [terminalAsset, setTerminalAsset] = useState(null);

  useEffect(() => {
    axios.get('/data/locations.json')
      .then(res => {
        setLocations(res.data);
        setLoadingLocations(false);
      })
      .catch(() => {
        setLocationsError('Fehler beim Laden der Standorte');
        setLoadingLocations(false);
      });
  }, []);

  const filteredLocations = useMemo(() => (locations || []).filter(loc => {
    if (filters.types.length > 0 && !filters.types.includes(loc.type)) {
      return false;
    }
    if (filters.statuses.length > 0 && !filters.statuses.includes(loc.status)) {
      return false;
    }
    if (filters.countries.length > 0 && !filters.countries.includes(loc.country)) {
      return false;
    }
    if (filters.search && filters.search.trim() !== '') {
      const searchLower = filters.search.toLowerCase();
      const matchesName = loc.name.toLowerCase().includes(searchLower);
      const matchesDescription = loc.description?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesDescription) {
        return false;
      }
    }
    return true;
  }), [filters, locations]);

  const displayedLocations = useMemo(
    () => filteredLocations.filter(location => isLayerEnabled(activeLayers, getLocationLayerKey(location))),
    [activeLayers, filteredLocations],
  );

  const allAssets = useMemo(() => {
    const merged = new Map();
    [...SEED_ASSETS, ...locations.map(normalizeLocation)].forEach(asset => {
      merged.set(asset.id, asset);
    });
    return [...merged.values()];
  }, [locations]);

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
    setSelectedAsset(normalizeLocation(location));
    setTemporaryPin(null);
  };

  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
    const matchedLocation = locations.find(location => location.id === asset.id || location.name === asset.name);
    setSelectedLocation(matchedLocation || null);
    setTemporaryPin(null);
    setMapFocusTarget({ center: asset.coordinates, zoom: 7 });
  };

  const handleSelectCoordinates = ({ lat, lon }) => {
    setSelectedLocation(null);
    setSelectedAsset(null);
    setTemporaryPin({ position: [lat, lon], label: `${lat.toFixed(4)}, ${lon.toFixed(4)}` });
    setMapFocusTarget({ center: [lat, lon], zoom: 8 });
  };

  const handleToggleEnterpriseLayer = (key) => {
    toggleLayer(key);
    if (key === 'rail') {
      setShowRailLayer(!activeLayers?.rail);
    }
  };

  const handleCloseAssetDrawer = () => {
    setSelectedAsset(null);
    setSelectedLocation(null);
  };

  function renderMainContent() {
    return (
      <div style={{ display: 'flex', gap: 20, height: '70vh', minHeight: 500, width: '100%' }}>
        <div className="map-wrapper" style={{ flex: 3, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', padding: 12, background: '#FFFFFF' }}>
          <SearchBar
            assets={allAssets}
            onSelectAsset={handleSelectAsset}
            onSelectCoordinates={handleSelectCoordinates}
          />
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            totalCount={locations.length}
            filteredCount={displayedLocations.length}
          />
          {loadingLocations ? (
            <div style={{ padding: 16 }}>Lade Standorte…</div>
          ) : locationsError ? (
            <div style={{ color: 'red', padding: 16 }}>{locationsError}</div>
          ) : (
            <div style={{ flex: 1, minHeight: 0 }}>
              <MapContainer
                center={[50, 10]}
                zoom={4}
                minZoom={2}
                maxZoom={19}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom
                zoomControl
                attributionControl={false}
              >
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                />
                {showEsriBoundaries && (
                  <TileLayer
                    url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                    opacity={esriOverlayOpacity}
                    attribution="Esri Boundaries & Places"
                  />
                )}
                {showEsriTransportation && (
                  <TileLayer
                    url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
                    opacity={esriOverlayOpacity}
                    attribution="Esri Transportation"
                  />
                )}
                {showEsriTopo && (
                  <TileLayer
                    url="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                    opacity={esriOverlayOpacity}
                    attribution="Esri Topo"
                  />
                )}
                {(showRailLayer || isLayerEnabled(activeLayers, 'rail')) && (
                  <TileLayer
                    url="https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
                    opacity={0.7}
                    attribution="&copy; OpenRailwayMap contributors"
                  />
                )}
                {showConnections && <LocationConnections locations={displayedLocations} />}
                {showHeatmap && (
                  <HeatmapOverlay
                    points={displayedLocations.map(l => ({
                      position: l.position,
                      intensity: l.status === 'critical' ? 1 : 0.3,
                    }))}
                  />
                )}
                <MapViewportController />
                <LocationMarkers onSelect={handleSelectLocation} locations={displayedLocations} filters={filters} />
                <StationMarkers />
              </MapContainer>
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 290, background: '#F7F9FB', border: '1px solid #CCCCCC', padding: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <AssetDrawer
            asset={selectedAsset}
            open={Boolean(selectedAsset)}
            onClose={handleCloseAssetDrawer}
            onOpenTerminal={setTerminalAsset}
          />
          <div style={{ padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <LayerManager activeLayers={activeLayers} onToggle={handleToggleEnterpriseLayer} />
            <div style={{ border: '1px solid #CCCCCC', background: '#FFFFFF', padding: 16 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 'bold', color: '#003366', mb: 1.5 }}>
                Map Overlays
              </Typography>
              <FormControlLabel
                control={<Checkbox checked={showConnections} onChange={e => setShowConnections(e.target.checked)} size="small" />}
                label={<Typography sx={{ fontSize: '11px', color: '#000000' }}>Show Connections</Typography>}
                sx={{ mt: 0, display: 'block' }}
              />
              <FormControlLabel
                control={<Checkbox checked={showHeatmap} onChange={e => setShowHeatmap(e.target.checked)} size="small" />}
                label={<Typography sx={{ fontSize: '11px', color: '#000000' }}>Show Heatmap</Typography>}
                sx={{ mt: 0.25, display: 'block' }}
              />
              <FormControlLabel
                control={<Checkbox checked={showEsriBoundaries} onChange={e => setShowEsriBoundaries(e.target.checked)} size="small" />}
                label={<Typography sx={{ fontSize: '11px', color: '#000000' }}>Boundaries & Places</Typography>}
                sx={{ mt: 0.25, display: 'block' }}
              />
              <FormControlLabel
                control={<Checkbox checked={showEsriTransportation} onChange={e => setShowEsriTransportation(e.target.checked)} size="small" />}
                label={<Typography sx={{ fontSize: '11px', color: '#000000' }}>Roads & Railways</Typography>}
                sx={{ mt: 0.25, display: 'block' }}
              />
              <FormControlLabel
                control={<Checkbox checked={showEsriTopo} onChange={e => setShowEsriTopo(e.target.checked)} size="small" />}
                label={<Typography sx={{ fontSize: '11px', color: '#000000' }}>Topography</Typography>}
                sx={{ mt: 0.25, display: 'block' }}
              />
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #CCCCCC' }}>
                <Typography variant="body2" sx={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', mb: 0.5 }}>
                  Overlay Transparency
                </Typography>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={esriOverlayOpacity}
                  onChange={e => setEsriOverlayOpacity(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
                <Typography variant="caption" sx={{ fontSize: '10px', color: '#666666' }}>
                  {Math.round(esriOverlayOpacity * 100)}%
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderTerminal() {
    if (!terminalAsset) {
      return null;
    }
    const TerminalComponent = CATEGORY_TERMINAL_MAP[terminalAsset.category];
    if (!TerminalComponent) {
      return null;
    }
    return (
      <TerminalComponent
        location={terminalAsset}
        onClose={() => setTerminalAsset(null)}
      />
    );
  }

  return (
    <div className="hive-mind-app">
      <div className="icon-container" onClick={() => setModalIsOpen(true)} title="Open Infrastructure Monitoring System">
        <FaBrain size={60} color="#003366" />
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="hive-mind-modal"
        overlayClassName="hive-mind-overlay"
        contentLabel="Infrastructure Monitoring System"
      >
        <div className="modal-header">
          <div className="modal-header-title">
            <h2>
              Operations Console
            </h2>
            <button className="close-btn" onClick={() => setModalIsOpen(false)}>×</button>
          </div>
          <div className="modal-header-subtitle">
            System Operations Layer
          </div>
        </div>
        {Array.isArray(locations) && locations.some(l => l.status === 'critical') && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Kritische Warnung: Mindestens ein Standort befindet sich im Status <b>Kritisch</b>!
          </Alert>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, padding: '0 16px' }}>
          <Button variant="outlined" size="small" onClick={() => downloadCsv(locations)}>
            Standorte als CSV exportieren
          </Button>
        </div>
        <div className="modal-content">
          {renderMainContent()}
        </div>
        <div className="modal-status-bar">
          <span>Operator: Administrator | Status: CONNECTED</span>
          <span>{displayedLocations.length} Assets | {new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</span>
        </div>
      </Modal>
      {renderTerminal()}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
