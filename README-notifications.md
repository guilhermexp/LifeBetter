# Sistema de Notificações do LifeBetter

Este documento descreve a implementação do sistema de notificações do aplicativo LifeBetter, incluindo sua arquitetura, funcionalidades e guias para desenvolvimento futuro.

## Visão Geral

O sistema de notificações do LifeBetter foi projetado para fornecer aos usuários alertas e lembretes importantes, garantindo que não percam prazos, compromissos ou tarefas críticas. As notificações são inteligentes e personalizáveis, ajustando-se ao comportamento do usuário.

## Arquitetura

O sistema é composto por três componentes principais:

1. **Interface de Usuário (UI)**

   - `NotificationsTab.tsx`: Componente React que exibe e gerencia notificações
   - Seções para notificações pendentes e histórico
   - Configurações para personalização de alertas

2. **Serviço de Notificações**

   - `notifications-service.ts`: Serviço para comunicação com o Supabase
   - Gerencia operações CRUD para notificações e preferências
   - Implementa lógica para envio de notificações

3. **Hook React**
   - `useNotifications.ts`: Hook para gerenciar estado e operações
   - Fornece métodos para interagir com o serviço de notificações
   - Implementa lógica de atualização e gerenciamento de estado

## Modelo de Dados

### Notificação

```typescript
interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "reminder" | "achievement" | "system" | "suggestion" | "change";
  created_at: string;
  read: boolean;
  actionable?: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
  expires_at?: string;
}
```

### Preferências de Notificação

```typescript
interface NotificationPreferences {
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  types_config: {
    events: boolean;
    tasks: boolean;
    suggestions: boolean;
    changes: boolean;
  };
  quiet_hours?: {
    enabled: boolean;
    start_time?: string;
    end_time?: string;
  };
  default_alerts: string[];
  allday_alerts: string[];
}
```

## Funcionalidades

### Gerenciamento de Notificações

- Visualização de notificações pendentes e históricas
- Marcação de notificações como lidas (individual ou todas)
- Exclusão de notificações (individual ou em lote)
- Contagem de notificações não lidas

### Configurações de Notificação

- Ativação/desativação de tipos de notificação
- Configuração de métodos de entrega (push, email, SMS)
- Definição de alertas padrão e para tarefas de dia inteiro
- Configuração de "quiet hours" (períodos sem notificação)

## Banco de Dados

O sistema utiliza duas tabelas principais no Supabase:

1. **notifications**: Armazena todas as notificações dos usuários
2. **notification_preferences**: Armazena as preferências de notificação dos usuários

Scripts SQL para criação das tabelas estão incluídos no arquivo `notifications-service.ts`.

## Guia de Implementação Futura

### 1. Implementar Notificações em Tempo Real

Atualmente, o sistema utiliza polling para atualizar as notificações a cada 30 segundos. Para uma experiência mais responsiva, recomenda-se implementar notificações em tempo real.

#### Passos para implementação:

1. Utilizar Supabase Realtime para inscrever-se em mudanças nas tabelas:

```typescript
// Em useNotifications.ts
useEffect(() => {
  if (!user?.id) return;

  // Inscrever-se em mudanças na tabela de notificações
  const subscription = supabase
    .from(`notifications:user_id=eq.${user.id}`)
    .on("INSERT", (payload) => {
      // Adicionar nova notificação ao estado
      setNotifications((prev) => [payload.new as Notification, ...prev]);
      // Atualizar contagem de não lidas
      if (!payload.new.read) {
        setUnreadCount((prev) => prev + 1);
      }
    })
    .on("UPDATE", (payload) => {
      // Atualizar notificação existente
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === payload.new.id ? (payload.new as Notification) : notif
        )
      );
      // Atualizar contagem de não lidas se necessário
      if (payload.old.read !== payload.new.read) {
        setUnreadCount((prev) => (payload.new.read ? prev - 1 : prev + 1));
      }
    })
    .on("DELETE", (payload) => {
      // Remover notificação do estado
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== payload.old.id)
      );
      // Atualizar contagem de não lidas se necessário
      if (!payload.old.read) {
        setUnreadCount((prev) => prev - 1);
      }
    })
    .subscribe();

  // Limpar inscrição ao desmontar
  return () => {
    subscription.unsubscribe();
  };
}, [user]);
```

2. Remover o polling existente após implementar o Realtime.

### 2. Adicionar Animações

Para melhorar a experiência do usuário, adicione animações suaves para transições entre estados.

#### Passos para implementação:

1. Utilizar a biblioteca Framer Motion para animações:

```typescript
// Em NotificationItem.tsx
import { motion, AnimatePresence } from "framer-motion";

// Animação para entrada/saída de notificações
<AnimatePresence>
  {notifications.map((notification) => (
    <motion.div
      key={notification.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <NotificationItem
        notification={notification}
        onMarkAsRead={markAsRead}
        onDelete={deleteNotification}
      />
    </motion.div>
  ))}
</AnimatePresence>;
```

2. Adicionar animações para:
   - Entrada e saída de notificações
   - Transição entre abas (pendentes/histórico)
   - Feedback visual ao marcar como lida ou excluir
   - Expansão/colapso de seções de configuração

### 3. Implementar Testes

Para garantir a robustez do sistema, implemente testes unitários e de integração.

#### Passos para implementação:

1. Testes unitários para o hook `useNotifications`:

```typescript
// Em useNotifications.test.ts
import { renderHook, act } from "@testing-library/react-hooks";
import { useNotifications } from "./useNotifications";
import { NotificationsService } from "@/integrations/supabase/notifications-service";

// Mock do serviço de notificações
jest.mock("@/integrations/supabase/notifications-service");

describe("useNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should load notifications on mount", async () => {
    // Mock da implementação
    NotificationsService.getNotifications.mockResolvedValue({
      notifications: [{ id: "1", title: "Test", read: false }],
      count: 1,
    });

    const { result, waitForNextUpdate } = renderHook(() => useNotifications());

    // Aguardar carregamento inicial
    await waitForNextUpdate();

    // Verificar se as notificações foram carregadas
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.unreadCount).toBe(1);
  });

  it("should mark notification as read", async () => {
    // Mock da implementação
    NotificationsService.markAsRead.mockResolvedValue(true);

    const { result } = renderHook(() => useNotifications());

    // Configurar estado inicial
    act(() => {
      result.current.setNotifications([
        { id: "1", title: "Test", read: false },
      ]);
      result.current.setUnreadCount(1);
    });

    // Marcar como lida
    await act(async () => {
      await result.current.markAsRead("1");
    });

    // Verificar se a notificação foi marcada como lida
    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });
});
```

2. Testes de integração para o componente `NotificationsTab`:

```typescript
// Em NotificationsTab.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NotificationsTab from "./NotificationsTab";
import { useNotifications } from "@/hooks/useNotifications";

// Mock do hook useNotifications
jest.mock("@/hooks/useNotifications");

describe("NotificationsTab", () => {
  beforeEach(() => {
    useNotifications.mockReturnValue({
      notifications: [
        {
          id: "1",
          title: "Test Notification",
          message: "Test message",
          read: false,
          type: "reminder",
        },
      ],
      unreadCount: 1,
      loading: false,
      markAsRead: jest.fn().mockResolvedValue(true),
      deleteNotification: jest.fn().mockResolvedValue(true),
    });
  });

  it("should render notifications", () => {
    render(<NotificationsTab />);

    // Verificar se a notificação é renderizada
    expect(screen.getByText("Test Notification")).toBeInTheDocument();
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("should mark notification as read when button is clicked", async () => {
    const mockMarkAsRead = jest.fn().mockResolvedValue(true);
    useNotifications.mockReturnValue({
      notifications: [
        {
          id: "1",
          title: "Test",
          message: "Test",
          read: false,
          type: "reminder",
          actionable: true,
        },
      ],
      unreadCount: 1,
      loading: false,
      markAsRead: mockMarkAsRead,
    });

    render(<NotificationsTab />);

    // Clicar no botão de concluir
    fireEvent.click(screen.getByText("Concluir"));

    // Verificar se a função foi chamada
    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith("1");
    });
  });
});
```

### 4. Integrar com Serviços Externos

Para enviar notificações por diferentes canais, integre com serviços externos.

#### Passos para implementação:

1. Integração com Firebase Cloud Messaging (FCM) para push notifications:

```typescript
// Em notifications-service.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Método para enviar notificação push
static async sendPushNotification(userId: string, title: string, body: string, data?: Record<string, any>): Promise<boolean> {
  try {
    // Verificar preferências do usuário
    const preferences = await this.getNotificationPreferences(userId);
    if (!preferences || !preferences.push_enabled) {
      return false;
    }

    if (!this.shouldSendNotification(preferences)) {
      return false;
    }

    // Buscar token FCM do usuário
    const { data: fcmData } = await supabase
      .from('user_fcm_tokens')
      .select('token')
      .eq('user_id', userId)
      .single();

    if (!fcmData?.token) {
      console.error('Token FCM não encontrado para o usuário:', userId);
      return false;
    }

    // Enviar notificação via Firebase Admin SDK (em uma função serverless)
    const response = await fetch('/api/send-push-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: fcmData.token,
        title,
        body,
        data
      }),
    });

    if (!response.ok) {
      throw new Error('Falha ao enviar notificação push');
    }

    // Registrar a notificação no banco de dados
    await this.createNotification({
      user_id: userId,
      title,
      message: body,
      type: 'system',
      read: false,
      metadata: data
    });

    return true;
  } catch (error) {
    console.error('Erro ao enviar notificação push:', error);
    return false;
  }
}
```

2. Integração com serviço de email (SendGrid):

```typescript
// Em uma função serverless do Supabase
import sgMail from "@sendgrid/mail";

// Configurar API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmailNotification(
  email: string,
  subject: string,
  text: string,
  html?: string
): Promise<boolean> {
  try {
    const msg = {
      to: email,
      from: "notifications@lifebetter.app",
      subject,
      text,
      html: html || text,
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return false;
  }
}
```

## Conclusão

O sistema de notificações do LifeBetter fornece uma base sólida para manter os usuários informados sobre tarefas importantes, compromissos e mudanças na agenda. Com as implementações futuras sugeridas, o sistema pode se tornar ainda mais robusto, responsivo e integrado.

Para qualquer dúvida ou sugestão, entre em contato com a equipe de desenvolvimento.
