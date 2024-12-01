import { PanelStateService as IPanelStateService } from '../types/electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PANEL_CONFIG } from '../../config/panelConfig';

interface PanelState {
  isCollapsed: boolean;
  width: number;
  height?: number;
  position?: 'left' | 'right' | 'center';
  lastPath?: string;
}

export class PanelStateService implements IPanelStateService {
  private readonly stateFile: string;
  private states: Map<string, PanelState>;

  constructor(private readonly configDir: string) {
    this.stateFile = path.join(configDir, 'panel-states.json');
    this.states = new Map();
    this.loadStates();
  }

  private async loadStates(): Promise<void> {
    try {
      await fs.access(this.configDir);
    } catch {
      await fs.mkdir(this.configDir, { recursive: true });
    }

    try {
      const data = await fs.readFile(this.stateFile, 'utf8');
      const parsed = JSON.parse(data);
      this.states = new Map(Object.entries(parsed));
    } catch (error) {
      // If file doesn't exist or is invalid, use defaults
      this.states = new Map();
      this.initializeDefaultStates();
    }
  }

  private initializeDefaultStates(): void {
    this.states.set('leftPanel', {
      isCollapsed: false,
      width: 300,
      position: 'left'
    });

    this.states.set('middlePanel', {
      isCollapsed: false,
      width: 600,
      position: 'center'
    });

    this.states.set('rightPanel', {
      isCollapsed: false,
      width: 300,
      position: 'right'
    });
  }

  private async persistStates(): Promise<void> {
    try {
      const data = JSON.stringify(Object.fromEntries(this.states), null, 2);
      await fs.writeFile(this.stateFile, data, 'utf8');
    } catch (error) {
      console.error('Error persisting panel states:', error);
      throw error;
    }
  }

  async saveState(panelId: string, state: PanelState): Promise<void> {
    if (!this.isValidState(state)) {
      throw new Error('Invalid panel state');
    }
    this.states.set(panelId, {
      ...state,
      position: this.getDefaultPosition(panelId)
    });
    await this.persistStates();
  }

  async setState(panelId: string, state: PanelState): Promise<void> {
    return this.saveState(panelId, state);
  }

  async getState(panelId: string): Promise<PanelState> {
    const state = this.states.get(panelId);
    if (!state) {
      // Return default state if none exists
      const defaultState: PanelState = {
        isCollapsed: false,
        width: panelId === 'middlePanel' ? 600 : 300,
        position: this.getDefaultPosition(panelId)
      };
      return defaultState;
    }
    return state;
  }

  private getDefaultPosition(panelId: string): 'left' | 'right' | 'center' {
    switch (panelId) {
      case 'leftPanel':
        return 'left';
      case 'rightPanel':
        return 'right';
      default:
        return 'center';
    }
  }

  private isValidState(state: Partial<PanelState>): boolean {
    // Basic validation rules
    if (typeof state.isCollapsed !== 'undefined' && typeof state.isCollapsed !== 'boolean') {
      return false;
    }

    if (typeof state.width !== 'undefined' && (typeof state.width !== 'number' || state.width < 0)) {
      return false;
    }

    if (state.height !== undefined && (typeof state.height !== 'number' || state.height < 0)) {
      return false;
    }

    if (state.position && !['left', 'right', 'center'].includes(state.position)) {
      return false;
    }

    return true;
  }

  async resetState(panelId: string): Promise<void> {
    const defaultState: PanelState = {
      isCollapsed: false,
      width: panelId === 'middlePanel' ? 600 : 300,
      position: this.getDefaultPosition(panelId)
    };

    await this.saveState(panelId, defaultState);
  }

  async resetAllStates(): Promise<void> {
    this.initializeDefaultStates();
    await this.persistStates();
  }

  async getAllStates(): Promise<Map<string, PanelState>> {
    return new Map(this.states);
  }

  async updateLastPath(panelId: string, path: string): Promise<void> {
    const state = await this.getState(panelId);
    state.lastPath = path;
    await this.saveState(panelId, state);
  }

  async getLastPath(panelId: string): Promise<string | undefined> {
    const state = await this.getState(panelId);
    return state.lastPath;
  }
} 