/**
 * Definições de tipos personalizados para o Service Worker
 */

interface ExtendableEvent extends Event {
  waitUntil(fn: Promise<any>): void;
}

interface FetchEvent extends ExtendableEvent {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

interface SyncEvent extends ExtendableEvent {
  tag: string;
}

interface PushEvent extends ExtendableEvent {
  data?: {
    json(): any;
    text(): string;
  };
}

interface NotificationEvent extends ExtendableEvent {
  notification: Notification & {
    data?: {
      url?: string;
      [key: string]: any;
    };
  };
  action: string;
}

interface Notification {
  close(): void;
  data?: any;
}

interface ServiceWorkerGlobalScope {
  caches: CacheStorage;
  clients: Clients;
  registration: ServiceWorkerRegistration;
  skipWaiting(): Promise<void>;
  addEventListener(
    type: 'install' | 'activate' | 'fetch' | 'sync' | 'push' | 'notificationclick',
    listener: (event: Event) => void
  ): void;
  location: {
    origin: string;
  };
}

interface Clients {
  claim(): Promise<void>;
  get(id: string): Promise<Client>;
  matchAll(options?: { type?: 'window' | 'worker' | 'sharedworker' | 'all' }): Promise<Client[]>;
  openWindow(url: string): Promise<Client>;
}

interface Client {
  id: string;
  url: string;
  postMessage(message: any): void;
  navigate?(url: string): Promise<Client>;
}

interface ServiceWorkerRegistration {
  showNotification(title: string, options?: NotificationOptions): Promise<void>;
  getNotifications(options?: { tag?: string }): Promise<Notification[]>;
}

interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  vibrate?: number[];
  data?: any;
  tag?: string;
  actions?: { action: string; title: string; icon?: string }[];
}
