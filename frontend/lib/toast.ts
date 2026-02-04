/**
 * Toast Notification System
 * Provides user-friendly error and success messages
 */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class ToastManager {
  private container: HTMLDivElement | null = null;

  private ensureContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 420px;
      `;
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  private getToastStyles(type: ToastType): string {
    const baseStyles = `
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      animation: slideIn 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    `;

    const typeStyles = {
      success: 'background: #10b981; color: white;',
      error: 'background: #ef4444; color: white;',
      warning: 'background: #f59e0b; color: white;',
      info: 'background: #3b82f6; color: white;',
    };

    return baseStyles + typeStyles[type];
  }

  private getIcon(type: ToastType): string {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };
    return icons[type];
  }

  show(message: string, type: ToastType = 'info', options: ToastOptions = {}) {
    const container = this.ensureContainer();
    const toast = document.createElement('div');
    
    toast.style.cssText = this.getToastStyles(type);
    
    const icon = document.createElement('span');
    icon.textContent = this.getIcon(type);
    icon.style.cssText = 'font-size: 20px; font-weight: bold;';
    
    const content = document.createElement('div');
    content.style.cssText = 'flex: 1;';
    content.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(content);

    if (options.action) {
      const button = document.createElement('button');
      button.textContent = options.action.label;
      button.style.cssText = `
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 4px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
      `;
      button.onclick = () => {
        options.action!.onClick();
        this.remove(toast);
      };
      toast.appendChild(button);
    }

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
    `;
    closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
    closeBtn.onmouseout = () => closeBtn.style.opacity = '0.7';
    closeBtn.onclick = () => this.remove(toast);
    toast.appendChild(closeBtn);

    container.appendChild(toast);

    // Auto remove
    const duration = options.duration || 5000;
    setTimeout(() => this.remove(toast), duration);

    return toast;
  }

  private remove(toast: HTMLElement) {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      toast.remove();
      if (this.container && this.container.children.length === 0) {
        this.container.remove();
        this.container = null;
      }
    }, 300);
  }

  success(message: string, options?: ToastOptions) {
    return this.show(message, 'success', options);
  }

  error(message: string, options?: ToastOptions) {
    return this.show(message, 'error', { duration: 7000, ...options });
  }

  warning(message: string, options?: ToastOptions) {
    return this.show(message, 'warning', options);
  }

  info(message: string, options?: ToastOptions) {
    return this.show(message, 'info', options);
  }

  /**
   * Handle API errors with appropriate messages
   */
  handleApiError(error: any) {
    if (error.response?.data?.code === 'LIMIT_EXCEEDED') {
      const data = error.response.data;
      this.error(data.message, {
        duration: 10000,
        action: {
          label: 'Upgrade Plan',
          onClick: () => {
            window.location.href = data.upgradeUrl || '/dashboard/settings?tab=billing';
          },
        },
      });
    } else if (error.response?.data?.error) {
      this.error(error.response.data.error);
    } else if (error.message) {
      this.error(error.message);
    } else {
      this.error('An unexpected error occurred. Please try again.');
    }
  }
}

// Add animations to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

export const toast = new ToastManager();
