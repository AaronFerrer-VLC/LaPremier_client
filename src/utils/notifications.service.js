/**
 * Notification Service
 * Handles browser notifications and in-app notifications
 */

import { notifySuccess, notifyError, notifyInfo, notifyWarning } from './notifications';

class NotificationService {
  constructor() {
    this.permission = null;
    this.checkPermission();
  }

  async checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      notifyWarning('Tu navegador no soporta notificaciones');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  async showNotification(title, options = {}) {
    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) {
      // Fallback a notificación in-app
      notifyInfo(title);
      return;
    }

    const notification = new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }

  // Notificaciones específicas
  async notifyNewRelease(movieTitle, releaseDate) {
    return this.showNotification('🎬 Nuevo Estreno', {
      body: `${movieTitle} se estrena el ${new Date(releaseDate).toLocaleDateString()}`,
      tag: `release-${movieTitle}`,
      requireInteraction: false
    });
  }

  async notifyPriceChange(cinemaName, oldPrice, newPrice) {
    return this.showNotification('💰 Cambio de Precio', {
      body: `${cinemaName}: ${oldPrice}€ → ${newPrice}€`,
      tag: `price-${cinemaName}`,
      requireInteraction: false
    });
  }

  async notifyFavoriteUpdate(movieTitle, type) {
    const message = type === 'favorite' 
      ? `${movieTitle} agregada a favoritos`
      : `${movieTitle} agregada a ver más tarde`;
    
    return this.showNotification('⭐ Actualización', {
      body: message,
      tag: `favorite-${movieTitle}`,
      requireInteraction: false
    });
  }
}

export default new NotificationService();

