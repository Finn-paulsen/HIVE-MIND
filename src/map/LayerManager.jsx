import { Checkbox, FormControlLabel, Paper, Typography } from '@mui/material';
import { AUDIT_EVENTS, logEvent } from '../audit/auditLogger';

const LAYERS = [
  { key: 'airports', label: 'Airports', color: '#003366' },
  { key: 'rail', label: 'Rail', color: '#666699' },
  { key: 'banks', label: 'Banks', color: '#006600' },
  { key: 'energy', label: 'Energy', color: '#FF8C00' },
  { key: 'datacenters', label: 'Datacenters', color: '#336699' },
  { key: 'power', label: 'Power', color: '#CC0000' },
  { key: 'water', label: 'Water', color: '#0088CC' },
  { key: 'hospital', label: 'Hospital', color: '#009966' },
  { key: 'police', label: 'Police', color: '#444444' },
  { key: 'military', label: 'Military', color: '#7A5C00' },
];

function isLayerEnabled(activeLayers, key) {
  if (activeLayers instanceof Set) {
    return activeLayers.has(key);
  }

  return Boolean(activeLayers?.[key]);
}

export function LayerManager({ activeLayers, onToggle }) {
  const handleToggle = (key) => {
    const nextActive = !isLayerEnabled(activeLayers, key);
    onToggle(key);
    logEvent(AUDIT_EVENTS.LAYER_TOGGLED, { layer: key, active: nextActive });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid #CCCCCC',
        borderRadius: 0,
        backgroundColor: '#FFFFFF',
        p: 2,
      }}
    >
      <Typography sx={{ fontSize: '12px', fontWeight: 'bold', color: '#003366', mb: 1.5 }}>
        Layer Manager
      </Typography>
      {LAYERS.map(layer => (
        <FormControlLabel
          key={layer.key}
          sx={{ display: 'flex', alignItems: 'center', ml: 0, mb: 0.25 }}
          control={(
            <Checkbox
              checked={isLayerEnabled(activeLayers, layer.key)}
              onChange={() => handleToggle(layer.key)}
              size="small"
              sx={{ p: 0.5, mr: 1 }}
            />
          )}
          label={(
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: layer.color,
                  display: 'inline-block',
                  border: '1px solid #CCCCCC',
                }}
              />
              <Typography sx={{ fontSize: '11px', color: '#000000' }}>{layer.label}</Typography>
            </div>
          )}
        />
      ))}
    </Paper>
  );
}
