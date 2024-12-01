import React from 'react';

interface TabProps {
  label: string;
  children: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ children }) => <>{children}</>;

interface TabsProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (label: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ children, activeTab, onTabChange }) => {
  const tabs = React.Children.toArray(children) as React.ReactElement[];
  
  return (
    <div className="tabs">
      <div className="tab-buttons">
        {tabs.map((tab) => (
          <button
            key={tab.props.label}
            className={`tab-btn ${activeTab === tab.props.label ? 'active' : ''}`}
            onClick={() => onTabChange?.(tab.props.label)}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tabs.find(tab => tab.props.label === activeTab)}
      </div>
    </div>
  );
}; 