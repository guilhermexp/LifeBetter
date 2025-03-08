/// <reference lib="webworker" />

/**
 * Service Worker para Sua Vida Melhor
 * 
 * Funcionalidades:
 * - Cache de arquivos estáticos para uso offline
 * - Interceptação de requisições para API
 * - Sincronização de dados quando online
 */

// Tipagem do self no Service Worker
declare const self: ServiceWorkerGlobalScope;

// Nome do cache
const CACHE_NAME = 'suavidamelhor-cache-v1';

// Arquivos a serem cacheados inicialmente
const STATIC_ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/index.css',
  '/assets/index.js',
  // Adicione outros arquivos estáticos importantes
];

// URLs da API que queremos tratar offline
const API_URL_PATTERN = /https:\/\/tjauuyydxagnugqvmigm\.supabase\.co\/rest\/v1\//;

// Event: Instalação do Service Worker
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[Service Worker] Instalando...');
  
  // Pre-cache arquivos estáticos
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cacheando arquivos estáticos');
        return cache.addAll(STATIC_ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] Instalação concluída');
        return self.skipWaiting();
      })
  );
});

// Event: Ativação do Service Worker
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[Service Worker] Ativando...');
  
  // Limpar caches antigos
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('[Service Worker] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
    .then(() => {
      console.log('[Service Worker] Agora controlando todas as abas');
      return self.clients.claim();
    })
  );
});

// Event: Interceptação de requisições
self.addEventListener('fetch', (event: FetchEvent) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Estratégia para arquivos estáticos: Cache First, then Network
  if (request.method === 'GET' && !API_URL_PATTERN.test(url.toString())) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          // Retorna do cache se disponível
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Caso contrário, busca na rede
          return fetch(request)
            .then(response => {
              // Guarda uma cópia no cache
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, responseClone);
                });
              }
              return response;
            });
        })
    );
  } 
  // Estratégia para API: Network First, then Cached/Fallback
  else if (API_URL_PATTERN.test(url.toString())) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Se a resposta for bem-sucedida, armazena no cache
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          console.log('[Service Worker] Falha na rede. Tentando cache para:', url.toString());
          
          // Tenta recuperar do cache
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Se não tiver no cache, verifica se é uma requisição de API e
              // retorna uma resposta offline adequada
              if (request.headers.get('Content-Type')?.includes('application/json')) {
                return new Response(
                  JSON.stringify({ 
                    error: 'offline',
                    message: 'Você está offline. Esta informação será sincronizada quando você estiver online novamente.'
                  }),
                  { 
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                  }
                );
              }
              
              // Para outras requisições, retorna um erro genérico
              return new Response('Offline', { status: 503 });
            });
        })
    );
  }
});

// Event: Sincronização em segundo plano
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'sync-tasks') {
    console.log('[Service Worker] Sincronizando tarefas...');
    event.waitUntil(syncTasks());
  }
});

// Event: Push notification
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Event: Clique na notificação
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' })
        .then(clientList => {
          // Se já tiver uma janela aberta, navega para a URL
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'navigate' in client) {
              return client.navigate(event.notification.data.url);
            }
          }
          // Caso contrário, abre uma nova janela
          return self.clients.openWindow(event.notification.data.url);
        })
    );
  }
});

// Função para sincronizar tarefas pendentes
async function syncTasks() {
  // Esta função seria implementada usando IndexedDB para buscar
  // tarefas pendentes e enviá-las para o servidor.
  // Por enquanto, este é apenas um placeholder.
  console.log('[Service Worker] Função de sincronização será implementada');
  return Promise.resolve();
}

// Função para notificar clientes sobre mudanças
async function notifyClients(message: any) {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => {
    client.postMessage(message);
  });
}

// Registra worker
console.log('[Service Worker] Script carregado!');
