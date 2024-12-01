const PANEL_CONFIG = {
  leftPanel: {
    id: 'left-panel',
    title: 'Writing Prompts',
    tabs: ['Writing Prompts', 'AI Assistant'],
    dimensions: {
      width: 300,
      minWidth: 200,
      maxWidth: 500,
    },
    defaultState: {
      isCollapsed: false,
      width: 300,
    },
    persistState: true,
  },
  middlePanel: {
    id: 'middle-panel',
    title: 'Scribblings',
    dimensions: {
      width: 600,
      minWidth: 400,
    },
    defaultState: {
      isCollapsed: false,
      width: 600,
    },
    persistState: true,
  },
  rightPanel: {
    id: 'right-panel',
    title: 'Feedback & Settings',
    tabs: ['AI Feedback', 'Criteria', 'Settings'],
    dimensions: {
      width: 300,
      minWidth: 200,
      maxWidth: 500,
    },
    defaultState: {
      isCollapsed: false,
      width: 300,
    },
    persistState: true,
  },
};

module.exports = { PANEL_CONFIG }; 