import { PanelState } from '../config/panelConfig';

export class Panel {
  private element: HTMLElement;
  private resizer: HTMLElement | null;
  private state: PanelState;
  private minWidth: number;
  private maxWidth: number | undefined;
  private isInitialized: boolean = false;

  constructor(
    private id: string,
    private config: any,
    private onStateChange?: (state: PanelState) => void
  ) {
    console.log(`Creating panel with id: ${id}`);
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Panel element with id ${id} not found`);
    }
    this.element = element;
    this.resizer = document.getElementById(`${id}-resizer`);
    this.minWidth = config.dimensions.minWidth;
    this.maxWidth = config.dimensions.maxWidth;
    this.state = {
      isCollapsed: false,
      width: config.dimensions.width
    };

    // Initialize immediately if DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializePanel());
    } else {
      this.initializePanel();
    }
  }

  private async initializePanel() {
    if (this.isInitialized) return;
    console.log(`Initializing panel: ${this.id}`);

    try {
      // Set default state first
      this.state = {
        isCollapsed: false,
        width: this.id === 'middlePanel' ? 600 : 300
      };

      // Try to load saved state
      const savedState = await window.electronAPI.panels.getState(this.id);
      console.log(`Loaded state for panel ${this.id}:`, savedState);
      
      if (savedState) {
        this.state = {
          ...this.state,
          ...savedState
        };
      }

      // Apply the state
      this.applyState();

      // Initialize resizer if present
      if (this.resizer) {
        this.initializeResizer();
      } else {
        console.warn(`No resizer found for panel ${this.id}`);
      }

      // Initialize tabs if present
      if (this.config.tabs) {
        this.initializeTabs();
      }

      this.isInitialized = true;
      console.log(`Panel ${this.id} initialization complete`);
    } catch (error) {
      console.error(`Failed to initialize panel ${this.id}:`, error);
      // Apply default state if loading fails
      this.applyState();
    }
  }

  private initializeResizer() {
    let startX: number;
    let startWidth: number;
    let isDragging = false;

    const startResize = (e: MouseEvent) => {
      console.log(`Starting resize for panel ${this.id}`);
      isDragging = true;
      startX = e.pageX;
      startWidth = this.element.offsetWidth;
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResize);
      document.body.style.cursor = 'col-resize';
    };

    const resize = (e: MouseEvent) => {
      if (!isDragging) return;
      const diff = e.pageX - startX;
      let newWidth = startWidth + diff;

      // Apply constraints
      if (this.minWidth) {
        newWidth = Math.max(newWidth, this.minWidth);
      }
      if (this.maxWidth) {
        newWidth = Math.min(newWidth, this.maxWidth);
      }

      this.state.width = newWidth;
      this.applyState();
    };

    const stopResize = () => {
      console.log(`Stopping resize for panel ${this.id}`);
      isDragging = false;
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
      document.body.style.cursor = '';
      this.saveState();
    };

    this.resizer?.addEventListener('mousedown', startResize);
  }

  private initializeTabs() {
    const tabButtons = this.element.querySelectorAll('.tab-btn');
    const contentAreas = this.element.querySelectorAll('[data-tab-content]');

    console.log(`Initializing ${tabButtons.length} tabs for panel ${this.id}`);

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        if (!tabName) return;

        console.log(`Switching to tab ${tabName} in panel ${this.id}`);

        // Update active tab button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Show active content area
        contentAreas.forEach(area => {
          const areaName = area.getAttribute('data-tab-content');
          area.classList.toggle('active', areaName === tabName);
        });
      });
    });
  }

  private applyState() {
    console.log(`Applying state to panel ${this.id}:`, this.state);
    
    if (!this.state) {
      console.warn(`No state found for panel ${this.id}, using defaults`);
      this.state = {
        isCollapsed: false,
        width: this.id === 'middlePanel' ? 600 : 300
      };
    }

    try {
      if (this.state.isCollapsed) {
        this.element.style.width = '0';
        this.element.classList.add('collapsed');
      } else {
        this.element.style.width = `${this.state.width}px`;
        this.element.classList.remove('collapsed');
      }

      if (this.onStateChange) {
        this.onStateChange(this.state);
      }
    } catch (error) {
      console.error(`Error applying state to panel ${this.id}:`, error);
    }
  }

  private async saveState() {
    try {
      console.log(`Saving state for panel ${this.id}:`, this.state);
      await window.electronAPI.panels.saveState(this.id, this.state);
    } catch (error) {
      console.error(`Failed to save panel state for ${this.id}:`, error);
    }
  }

  public toggleCollapse() {
    console.log(`Toggling collapse for panel ${this.id}`);
    this.state.isCollapsed = !this.state.isCollapsed;
    if (this.state.isCollapsed) {
      this.state.lastWidth = this.state.width;
      this.state.width = 0;
    } else if (this.state.lastWidth) {
      this.state.width = this.state.lastWidth;
    }
    this.applyState();
    this.saveState();
  }
} 