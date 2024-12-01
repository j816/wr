interface NotificationOptions {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

export class NotificationService {
  private static notifications: NotificationOptions[] = [];
  private static listeners: ((notifications: NotificationOptions[]) => void)[] = [];

  static show(options: NotificationOptions): void {
    this.notifications.push(options);
    this.notifyListeners();

    if (options.duration) {
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n !== options);
        this.notifyListeners();
      }, options.duration);
    }
  }

  static subscribe(listener: (notifications: NotificationOptions[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  static success(message: string, title: string = 'Success'): void {
    this.show({
      type: 'success',
      title,
      message,
      duration: 3000
    });
  }

  static error(message: string, title: string = 'Error'): void {
    this.show({
      type: 'error',
      title,
      message,
      duration: 5000
    });
  }

  static info(message: string, title: string = 'Information'): void {
    this.show({
      type: 'info',
      title,
      message,
      duration: 3000
    });
  }

  static warning(message: string, title: string = 'Warning'): void {
    this.show({
      type: 'warning',
      title,
      message,
      duration: 4000
    });
  }

  static showError(message: string): void {
    this.error(message);
  }

  static showSuccess(message: string): void {
    this.success(message);
  }

  static showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.show({
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      message,
      duration: type === 'error' ? 5000 : 3000
    });
  }
} 