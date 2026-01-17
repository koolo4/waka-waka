import { useCallback } from 'react';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = useCallback(({ title, description, variant = 'default' }: ToastProps) => {
    // Используем встроенный alert как fallback
    if (title || description) {
      console.log(`[${variant}] ${title}: ${description}`);
      // Можно добавить собственную реализацию toast уведомлений здесь
      if (variant === 'destructive') {
        console.error(`${title}: ${description}`);
      }
    }
  }, []);

  return { toast };
}
