import * as fs from 'fs/promises';
import * as path from 'path';

export class SettingsService {
  private readonly settingsFile: string;

  constructor() {
    const appDataPath = process.env.APPDATA || (
      process.platform === 'darwin'
        ? path.join(process.env.HOME || '', 'Library', 'Application Support')
        : path.join(process.env.HOME || '', '.config')
    );
    this.settingsFile = path.join(appDataPath, 'writing-assistant', 'settings.json');
  }

  private async ensureSettingsFile(): Promise<void> {
    try {
      const dir = path.dirname(this.settingsFile);
      await fs.access(dir);
    } catch {
      await fs.mkdir(path.dirname(this.settingsFile), { recursive: true });
    }
  }

  private async readSettings(): Promise<Record<string, any>> {
    try {
      await this.ensureSettingsFile();
      const data = await fs.readFile(this.settingsFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  private async writeSettings(settings: Record<string, any>): Promise<void> {
    await this.ensureSettingsFile();
    await fs.writeFile(this.settingsFile, JSON.stringify(settings, null, 2));
  }

  async updateApiKey(apiKey: string): Promise<void> {
    const settings = await this.readSettings();
    settings.apiKey = apiKey;
    await this.writeSettings(settings);
  }

  async getApiKey(): Promise<string | null> {
    const settings = await this.readSettings();
    return settings.apiKey || null;
  }

  async deleteApiKey(): Promise<void> {
    const settings = await this.readSettings();
    delete settings.apiKey;
    await this.writeSettings(settings);
  }

  async getSetting<T>(key: string): Promise<T | null> {
    const settings = await this.readSettings();
    return settings[key] || null;
  }

  async updateSetting<T>(key: string, value: T): Promise<void> {
    const settings = await this.readSettings();
    settings[key] = value;
    await this.writeSettings(settings);
  }

  async deleteSetting(key: string): Promise<void> {
    const settings = await this.readSettings();
    delete settings[key];
    await this.writeSettings(settings);
  }
} 