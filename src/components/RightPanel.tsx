import React, { useState } from 'react';
import { AIFeedbackTab } from './AIFeedbackTab';
import { CriteriaTab } from './CriteriaTab';
import { SettingsTab } from './SettingsTab';
import styles from './RightPanel.module.css';
import { Tabs, Tab } from './common/Tabs';
import { AIFeedback } from './AIFeedback';
import { Criteria } from './Criteria';

export const RightPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('AI Feedback');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <div className={styles.rightPanel}>
      <Tabs>
        <Tab label="AI Feedback">
          <AIFeedbackTab isLoading={isLoading} feedback={feedback} />
        </Tab>
        <Tab label="Criteria">
          <CriteriaTab />
        </Tab>
        <Tab label="Settings">
          <SettingsTab />
        </Tab>
      </Tabs>
    </div>
  );
}; 