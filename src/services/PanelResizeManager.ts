import { PanelState } from '../types/panels';

export class PanelResizeManager {
  private panelStates: Map<string, PanelState>;
  private readonly minWidth: number = 200;
  private readonly maxWidth: number = 800;

  constructor() {
    this.panelStates = new Map();
  }

  initializePanel(id: string, position: 'left' | 'right' | 'center', initialWidth: number): void {
    const initialState: PanelState = {
      width: initialWidth,
      isCollapsed: false,
      lastWidth: initialWidth,
      position,
      lastPath: undefined
    };
    this.panelStates.set(id, initialState);
  }

  updatePanelState(id: string, updates: Partial<PanelState>): void {
    const currentState = this.panelStates.get(id);
    if (!currentState) return;

    const newState: PanelState = {
      ...currentState,
      ...updates,
      width: updates.width !== undefined ? 
        Math.max(this.minWidth, Math.min(this.maxWidth, updates.width)) : 
        currentState.width
    };

    this.panelStates.set(id, newState);
  }

  getPanelState(id: string): PanelState | undefined {
    return this.panelStates.get(id);
  }

  togglePanelCollapse(id: string): void {
    const state = this.panelStates.get(id);
    if (!state) return;

    const newState: PanelState = {
      ...state,
      isCollapsed: !state.isCollapsed,
      width: state.isCollapsed ? (state.lastWidth || 0) : state.width,
      lastWidth: state.isCollapsed ? state.width : state.lastWidth
    };

    this.panelStates.set(id, newState);
  }
} 