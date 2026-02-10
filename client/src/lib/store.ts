import { create } from 'zustand';
import { type Alert, type Device, SEVERITY, STATUS } from '@shared/schema';

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  simulationActive: boolean;
  toggleSimulation: () => void;
  
  // Simulation Data (Client-side mainly for "alive" feel, syncs with backend ideally)
  activeFeedId: number | null;
  setActiveFeed: (id: number | null) => void;
}

export const useStore = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  simulationActive: true,
  toggleSimulation: () => set((state) => ({ simulationActive: !state.simulationActive })),
  
  activeFeedId: 1,
  setActiveFeed: (id) => set({ activeFeedId: id }),
}));
