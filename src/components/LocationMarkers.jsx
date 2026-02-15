import { Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { FaBolt, FaBuilding, FaServer } from 'react-icons/fa';
import { Button, Typography, Divider } from '@mui/material';

// Beispielhafte Standorte und Typen
// Standorte werden jetzt dynamisch über props.locations übergeben

const typeIcon = {
  power: <FaBolt color="#2a4a7b" />,
  base: <FaBuilding color="#2a4a7b" />,
  server: <FaServer color="#2a4a7b" />,
  gov: <FaBuilding color="#2a4a7b" />,
  airport: <FaBuilding color="#2a4a7b" />,
  water: <FaBuilding color="#2a4a7b" />,
  control: <FaBuilding color="#2a4a7b" />,
  hospital: <FaBuilding color="#2a4a7b" />,
  fire: <FaBuilding color="#2a4a7b" />,
  police: <FaBuilding color="#2a4a7b" />,
  school: <FaBuilding color="#2a4a7b" />,
  cityhall: <FaBuilding color="#2a4a7b" />,
  bridge: <FaBuilding color="#2a4a7b" />,
  port: <FaBuilding color="#2a4a7b" />,
  energy: <FaBolt color="#2a4a7b" />,
  metro: <FaBuilding color="#2a4a7b" />,
  university: <FaBuilding color="#2a4a7b" />,
};

const statusLabel = {
  active: 'Aktiv',
  critical: 'Kritisch',
  offline: 'Offline',
};

export function LocationMarkers({ onSelect, typeFilter, searchTerm, locations }) {
  // Filter/Seach logic
  const filtered = (locations || []).filter(loc => {
    const matchesType = !typeFilter || loc.type === typeFilter;
    const matchesSearch = !searchTerm ||
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loc.description && loc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });
  return (
    <MarkerClusterGroup>
      {filtered.map(loc => (
        <Marker key={loc.id} position={loc.position}>
          <Popup>
            <div style={{ minWidth: 220 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2a4a7b', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                {typeIcon[loc.type]} {loc.name}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Status: <b style={{ color: '#2a4a7b' }}>{statusLabel[loc.status]}</b>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>{loc.description}</Typography>
              {Array.isArray(loc.history) && loc.history.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Status-Verlauf:</Typography>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {loc.history.map((h, idx) => (
                      <li key={idx} style={{ fontSize: 13, color: '#2a4a7b' }}>
                        {new Date(h.timestamp).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}: <b>{statusLabel[h.status] || h.status}</b>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Button
                  variant="contained"
                  size="small"
                  sx={{ backgroundColor: '#2a4a7b', color: '#fff', boxShadow: 'none', '&:hover': { backgroundColor: '#1a2a4a' } }}
                  onClick={() => onSelect && onSelect(loc)}
                >
                  In KraftwerkControl öffnen
                </Button>
                {loc.infoUrl && (
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ color: '#2a4a7b', borderColor: '#2a4a7b' }}
                    href={loc.infoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Mehr Infos
                  </Button>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}

export const LOCATIONS_DATA = LOCATIONS;
