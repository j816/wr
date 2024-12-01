import React from 'react';
import ApiKeyForm from './ApiKeyForm';
import styles from './Settings.module.css';

const Settings: React.FC = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Settings</h2>
      <div className={styles.section}>
        <ApiKeyForm onSaved={() => {}} onError={() => {}} />
      </div>
    </div>
  );
};

export default Settings; 