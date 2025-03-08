# Guia de Estilo - SuaVidaMelhor

Este documento contém diretrizes para implementação do novo sistema de design do projeto SuaVidaMelhor, focado na padronização da interface do usuário e na consistência visual em todo o aplicativo.

## Visão Geral

O arquivo `StyleGuide.tsx` contém constantes, tipos e funções utilitárias que definem padrões de estilo para todos os componentes do aplicativo. Estes padrões incluem:

- Tipografia (tamanhos de fonte, pesos, espaçamento)
- Espaçamento (padding, margens)
- Cores e gradientes
- Estilos de formulário
- Cartões e containers
- Modais e diálogos
- Botões
- Bordas e sombras

## Como Usar o Guia de Estilo

### Importando Estilos

```tsx
import { Typography, Colors, Forms, Spacing } from "@/styles/StyleGuide";
```

### Aplicando Estilos de Tipografia

```tsx
<h1 className={Typography.h1}>Título Principal</h1>
<h2 className={Typography.h2}>Título de Seção</h2>
<p className={Typography.body}>Texto padrão do corpo do documento</p>
<span className={Typography.hint}>Texto secundário de dica</span>
```

### Utilizando Cores e Gradientes

```tsx
// Gradiente primário para botões
<button className={Colors.primary.gradient}>Botão Primário</button>

// Fundo de sucesso
<div className={Colors.success.default}>Sucesso!</div>

// Cor de texto de alerta
<span className={Colors.warning.text}>Atenção</span>
```

### Estilos de Formulário

```tsx
<div className={Forms.formGroup}>
  <label className={Forms.label}>Nome</label>
  <input className={Forms.input} type="text" />
  <p className={Forms.hint}>Digite seu nome completo</p>
</div>
```

### Usando as Funções Utilitárias

```tsx
// Obter classes padrão para um formulário
const formClasses = getFormClasses();

// Obter classes para um cartão (com estado ativo opcional)
const cardClasses = getCardClasses(isActive);

// Obter classes para um modal de tamanho específico
const modalClasses = getModalClasses('md');
```

## Exemplos de Implementação

### Cartão Padrão

```tsx
import { getCardClasses } from "@/styles/StyleGuide";

export function StandardCard({ title, description, children, isActive }) {
  const cardClasses = getCardClasses(isActive);
  
  return (
    <div className={cardClasses.card}>
      <div className={cardClasses.header}>
        <h3 className={Typography.h3}>{title}</h3>
        {description && <p className={Typography.cardDescription}>{description}</p>}
      </div>
      <div className={cardClasses.content}>
        {children}
      </div>
    </div>
  );
}
```

### Modal Padronizado

```tsx
import { getModalClasses, Typography, ButtonStyles } from "@/styles/StyleGuide";

export function StandardModal({ title, isOpen, onClose, children, size = 'md' }) {
  const modalClasses = getModalClasses(size);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={modalClasses.container}>
        <DialogHeader className={modalClasses.header}>
          <DialogTitle className={Typography.modalTitle}>{title}</DialogTitle>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className={modalClasses.body}>
          {children}
        </div>
        
        <DialogFooter className={modalClasses.footer}>
          <Button 
            className={ButtonStyles.secondary} 
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button 
            className={ButtonStyles.primary}
            onClick={handleAction}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Padronização Aplicada

Como parte da implementação do novo guia de estilo, os seguintes componentes foram padronizados:

1. `AreaCard.tsx` - Convertido para usar o componente Card base e estilos consistentes
2. `EventModal.tsx` - Atualizado para seguir os padrões de modal com tamanho, espaçamento e cores consistentes
3. *Componentes adicionais serão atualizados gradualmente*

## Próximos Passos

1. Continuar a padronização de todos os componentes do aplicativo
2. Criar componentes base que usam o estilo padrão por default
3. Implementar verificações de design no pipeline de CI/CD
4. Adicionar documentação visual com exemplos em Storybook
