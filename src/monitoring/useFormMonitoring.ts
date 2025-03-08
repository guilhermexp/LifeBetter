
import { useEffect, useState } from 'react';
import { errorTracker } from './errorTracker';

/**
 * Hook para monitorar e corrigir erros em formulários
 */
export function useFormMonitoring<T extends object>(
  initialValues: T,
  validator?: (values: T) => Record<string, string>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptedAutoFix, setAttemptedAutoFix] = useState(false);
  
  // Função para atualizar um campo único
  const handleChange = (field: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar o erro quando o campo é alterado
    if (errors[field as string]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  // Aplicar validação quando os valores mudarem
  useEffect(() => {
    if (validator && isSubmitting) {
      const validationErrors = validator(values);
      
      setErrors(validationErrors);
      
      // Se houver erros, tente corrigi-los automaticamente
      if (Object.keys(validationErrors).length > 0 && !attemptedAutoFix) {
        // Tentativa de auto-correção silenciosa
        const fixedValues = { ...values };
        let fixedAny = false;
        
        // Para cada erro, tente aplicar uma correção básica
        Object.entries(validationErrors).forEach(([field, error]) => {
          const value = (values as any)[field];
          
          // Tentativas de correção comuns
          if (typeof value === 'string') {
            if (error.includes('required') && !value.trim()) {
              // Não podemos assumir um valor para campos obrigatórios
            } else if (error.includes('email') && !value.includes('@')) {
              // Não corrige emails inválidos
            } else if (error.includes('min') && value.length < 3) {
              // Não estender valores mínimos
            } else if (error.includes('max') && value.length > 100) {
              // Truncar valores muito longos
              (fixedValues as any)[field] = value.substring(0, 100);
              fixedAny = true;
              
              // Registra a correção silenciosa
              errorTracker.trackError({
                type: 'form-autofix',
                message: `Campo ${field} truncado automaticamente de ${value.length} para 100 caracteres`
              });
            } else if (value.includes('  ')) {
              // Corrigir espaços duplos
              (fixedValues as any)[field] = value.replace(/\s+/g, ' ').trim();
              fixedAny = true;
            }
          } else if (typeof value === 'number') {
            if (error.includes('min') && value < 0) {
              // Corrigir números negativos para zero
              (fixedValues as any)[field] = 0;
              fixedAny = true;
            } else if (error.includes('max') && value > 1000000) {
              // Limitar números muito grandes
              (fixedValues as any)[field] = 1000000;
              fixedAny = true;
            }
          }
        });
        
        // Se algo foi corrigido, atualize os valores
        if (fixedAny) {
          setValues(fixedValues);
          setAttemptedAutoFix(true);
          
          // Executa a validação novamente
          const newErrors = validator(fixedValues);
          setErrors(newErrors);
        } else {
          setAttemptedAutoFix(true);
        }
      }
      
      setIsSubmitting(false);
    }
  }, [values, isSubmitting, validator, attemptedAutoFix]);
  
  // Função para validar e submeter o formulário
  const handleSubmit = async (
    onSubmit: (values: T) => Promise<void> | void, 
    event?: React.FormEvent
  ) => {
    if (event) {
      event.preventDefault();
    }
    
    setIsSubmitting(true);
    setAttemptedAutoFix(false);
    
    // Aplicar validação
    if (validator) {
      const validationErrors = validator(values);
      setErrors(validationErrors);
      
      if (Object.keys(validationErrors).length > 0) {
        setIsSubmitting(false);
        return;
      }
    }
    
    try {
      await onSubmit(values);
    } catch (error) {
      // Registrar erro de submissão
      errorTracker.trackError({
        type: 'form-submission-error',
        message: `Erro ao submeter formulário: ${String(error)}`,
        stack: (error as Error).stack
      });
      
      // Adicionar erro geral
      setErrors(prev => ({
        ...prev,
        _general: 'Erro ao processar formulário. Tente novamente.'
      }));
    }
    
    setIsSubmitting(false);
  };
  
  // Função para resetar o formulário
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
    setAttemptedAutoFix(false);
  };
  
  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setValues
  };
}
