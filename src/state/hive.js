import { create } from 'zustand';

export const useHiveStore = create(set => ({
  selectedLocation: null,
  setSelectedLocation: (loc) => set({ selectedLocation: loc }),
  showConnections: true,
  setShowConnections: (val) => set({ showConnections: val }),
  showRailLayer: false,
  setShowRailLayer: (val) => set({ showRailLayer: val }),
  // Weitere globale States können hier ergänzt werden
}));
