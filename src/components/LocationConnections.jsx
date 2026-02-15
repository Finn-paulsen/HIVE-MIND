import { Polyline } from 'react-leaflet';
import { LOCATIONS_DATA } from './LocationMarkers';

// Beispielhafte Verbindungen zwischen Standorten (über IDs)
const CONNECTIONS = [
  ['power-1', 'base-1'],
  ['base-1', 'server-1'],
  ['power-1', 'server-1'],
];

function getPositionById(id) {
  const loc = LOCATIONS_DATA.find(l => l.id === id);
  return loc ? loc.position : null;
}

export function LocationConnections() {
  return (
    <>
      {CONNECTIONS.map(([from, to], idx) => {
        const fromPos = getPositionById(from);
        const toPos = getPositionById(to);
        if (!fromPos || !toPos) return null;
        return (
          <Polyline
            key={idx}
            positions={[fromPos, toPos]}
            pathOptions={{ color: '#b0b7c3', weight: 2, dashArray: '6 6' }}
          />
        );
      })}
    </>
  );
}
