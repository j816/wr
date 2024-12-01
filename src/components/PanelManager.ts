import { PanelStateService } from '../services/PanelStateService';
import { PANEL_CONFIG, PanelState, PanelsConfig } from '../config/panelConfig';

export class PanelManager {
  private stateService: PanelStateService;
  private resizeHandlers: Map<string, (event: MouseEvent) => void>;
  private isResizing: boolean;
  private currentPanel: string | null;

  constructor(userDataPath: string) {
    this.stateService = new PanelStateService(userDataPath);
    this.resizeHandlers = new Map();
    this.isResizing = false;
    this.currentPanel = null;
    this.initializePanels();
  }

  private async initializePanels(): Promise<void> {
    (Object.keys(PANEL_CONFIG) as Array<keyof PanelsConfig>).forEach(async (panelId) => {
      const config = PANEL_CONFIG[panelId];
      const panel = document.getElementById(config.id);
      if (!panel) return;

      // Load saved state or use default
      const savedState = await this.stateService.getState(String(panelId));
      const state = savedState || config.defaultState;

      // Apply initial state
      this.applyPanelState(panelId, state);
    });
  }

  private applyPanelState(panelId: keyof PanelsConfig, state: PanelState): void {
    const config = PANEL_CONFIG[panelId];
    const panel = document.getElementById(config.id);
    if (!panel) return;

    panel.style.width = `${state.width}px`;
    panel.classList.toggle('collapsed', state.isCollapsed);
  }

  private addResizeHandle(panelId: keyof PanelsConfig): void {
    const config = PANEL_CONFIG[panelId];
    const panel = document.getElementById(config.id);
    if (!panel) return;

    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    panel.appendChild(handle);

    const resizeHandler = this.createResizeHandler(panelId);
    this.resizeHandlers.set(String(panelId), resizeHandler);
    handle.addEventListener('mousedown', (e) => {
      this.isResizing = true;
      this.currentPanel = String(panelId);
      document.addEventListener('mousemove', resizeHandler);
      document.addEventListener('mouseup', () => this.stopResize());
      e.preventDefault();
    });
  }

  private createResizeHandler(panelId: keyof PanelsConfig): (event: MouseEvent) => void {
    return (e: MouseEvent) => {
      if (!this.isResizing || this.currentPanel !== String(panelId)) return;

      const config = PANEL_CONFIG[panelId];
      const panel = document.getElementById(config.id);
      if (!panel) return;

      const newWidth = e.clientX - panel.getBoundingClientRect().left;

      // Enforce min/max width constraints
      const width = Math.max(
        config.dimensions.minWidth,
        config.dimensions.maxWidth ? Math.min(newWidth, config.dimensions.maxWidth) : newWidth
      );

      panel.style.width = `${width}px`;

      // Save state
      const state: PanelState = {
        isCollapsed: false,
        width
      };
      this.stateService.setState(String(panelId), state).catch(console.error);
    };
  }

  private stopResize(): void {
    if (!this.currentPanel) return;
    
    this.isResizing = false;
    const handler = this.resizeHandlers.get(this.currentPanel);
    if (handler) {
      document.removeEventListener('mousemove', handler);
    }
    this.currentPanel = null;
  }

  // Public methods for panel control
  async togglePanel(panelId: keyof PanelsConfig): Promise<void> {
    const config = PANEL_CONFIG[panelId];
    const panel = document.getElementById(config.id);
    if (!panel) return;

    const currentState = await this.stateService.getState(String(panelId)) || config.defaultState;
    const newState: PanelState = {
      isCollapsed: !currentState.isCollapsed,
      width: currentState.width,
      lastWidth: currentState.lastWidth
    };

    this.applyPanelState(panelId, newState);
    await this.stateService.setState(String(panelId), newState);
  }

  async resetPanelState(panelId: keyof PanelsConfig): Promise<void> {
    const config = PANEL_CONFIG[panelId];
    this.applyPanelState(panelId, config.defaultState);
    await this.stateService.resetState(String(panelId));
  }
} 