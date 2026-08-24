import { create } from 'zustand';

const DEFAULT_ACTIVE_LAYERS = {
  airports: true,
  rail: true,
  energy: true,
  datacenters: true,
  power: true,
  water: true,
  hospital: true,
  police: true,
};

export const useHiveStore = create(set => ({
  selectedLocation: null,
  setSelectedLocation: (loc) => set({ selectedLocation: loc }),
  selectedAsset: null,
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),
  showConnections: true,
  setShowConnections: (val) => set({ showConnections: val }),
  showRailLayer: false,
  setShowRailLayer: (val) => set({ showRailLayer: val }),
  showEsriBoundaries: false,
  setShowEsriBoundaries: (val) => set({ showEsriBoundaries: val }),
  showEsriTransportation: false,
  setShowEsriTransportation: (val) => set({ showEsriTransportation: val }),
  showEsriTopo: false,
  setShowEsriTopo: (val) => set({ showEsriTopo: val }),
  esriOverlayOpacity: 0.7,
  setEsriOverlayOpacity: (val) => set({ esriOverlayOpacity: val }),
  activeLayers: DEFAULT_ACTIVE_LAYERS,
  toggleLayer: (key) => set(state => ({
    activeLayers: {
      ...state.activeLayers,
      [key]: !state.activeLayers?.[key],
    },
  })),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  mapFocusTarget: null,
  setMapFocusTarget: (target) => set({ mapFocusTarget: target }),
  temporaryPin: null,
  setTemporaryPin: (pin) => set({ temporaryPin: pin }),
  // Weitere globale States können hier ergänzt werden
}));
