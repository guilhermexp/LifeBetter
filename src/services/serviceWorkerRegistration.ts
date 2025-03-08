/**
 * Serviço para registrar e gerenciar o Service Worker do aplicativo
 * 
 * Este serviço:
 * - Registra o Service Worker
 * - Detecta novas versões disponíveis
 * - Notifica o usuário sobre atualizações
 * - Fornece métodos para interagir com o SW
 */

// Caminho do arquivo do service worker
const SERVICE_WORKER_PATH = '/service-worker.js';

// Opções de registro
const REGISTRATION_OPTIONS = {
  scope: '/'
};

// Estado de registro
let registration: ServiceWorkerRegistration | null = null;

// Para rastrear se já notificamos o usuário sobre alguma atualização
let updateNotifiedState = false;

/**
 * Registra o service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers não são suportados neste navegador');
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Service Worker não será registrado em ambiente de desenvolvimento');
    return null;
  }

  try {
    // Registrar o service worker
    registration = await navigator.serviceWorker.register(
      SERVICE_WORKER_PATH,
      REGISTRATION_OPTIONS
    );

    console.log('Service Worker registrado com sucesso com escopo:', registration.scope);

    // Configurar tratamento de atualização
    setupUpdateHandling(registration);

    return registration;
  } catch (error) {
    console.error('Erro ao registrar o Service Worker:', error);
    return null;
  }
}

/**
 * Configura tratamento de atualizações do SW
 */
function setupUpdateHandling(reg: ServiceWorkerRegistration) {
  // Verificar se há uma atualização na instalação
  if (reg.installing) {
    trackInstallation(reg.installing);
  }

  // Verificar se há uma atualização na espera (waiting)
  if (reg.waiting) {
    notifyUpdateReady(reg.waiting);
  }

  // Escutar por atualizações futuras
  reg.addEventListener('updatefound', () => {
    if (reg.installing) {
      trackInstallation(reg.installing);
    }
  });

  // Detectar quando um service worker em espera assume o controle
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Recarrega a página para garantir todos os recursos atualizados
    if (!updateNotifiedState) {
      window.location.reload();
    }
  });
}

/**
 * Acompanha o progresso de instalação de um SW
 */
function trackInstallation(worker: ServiceWorker) {
  worker.addEventListener('statechange', () => {
    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
      // O SW está instalado, mas está aguardando para ativar (skipWaiting)
      notifyUpdateReady(worker);
    }
  });
}

/**
 * Notifica sobre nova versão disponível
 */
function notifyUpdateReady(worker: ServiceWorker) {
  updateNotifiedState = true;

  // Aqui você pode mostrar um componente de notificação na interface
  // Por exemplo, chamando um callback definido pelo usuário

  // Exemplo de como acionar a atualização:
  // const updateAccepted = window.confirm('Nova versão disponível! Atualizar agora?');
  // if (updateAccepted) {
  //   worker.postMessage({ type: 'SKIP_WAITING' });
  // }
}

/**
 * Envia mensagem para o Service Worker
 */
export function sendMessageToSW(message: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!navigator.serviceWorker.controller) {
      reject(new Error('Não há Service Worker controlando esta página'));
      return;
    }

    // Criar canal de mensagens para a resposta
    const messageChannel = new MessageChannel();
    
    // Configurar canal de retorno para resposta
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data);
    };

    // Enviar a mensagem
    navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
  });
}

/**
 * Aciona atualização do Service Worker
 */
export function triggerUpdate() {
  if (!registration) {
    console.warn('Não há Service Worker registrado');
    return;
  }

  // Força o service worker a atualizar
  registration.update().catch(err => {
    console.error('Erro ao atualizar o Service Worker:', err);
  });
}

/**
 * Verifica se o navegador suporta Service Workers
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

/**
 * Verifica se o aplicativo está sendo executado no modo offline-first
 */
export function isOfflineFirst(): boolean {
  return isServiceWorkerSupported() && !!navigator.serviceWorker.controller;
}

/**
 * Desregistra o Service Worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!registration) {
    return false;
  }

  try {
    const success = await registration.unregister();
    console.log(success ? 'Service Worker desregistrado com sucesso' : 'Falha ao desregistrar o Service Worker');
    return success;
  } catch (error) {
    console.error('Erro ao desregistrar o Service Worker:', error);
    return false;
  }
}

// Iniciar o registro automaticamente
window.addEventListener('load', registerServiceWorker);

// Exportar interface do serviço
export default {
  register: registerServiceWorker,
  unregister: unregisterServiceWorker,
  sendMessage: sendMessageToSW,
  triggerUpdate,
  isSupported: isServiceWorkerSupported,
  isOfflineFirst
};
