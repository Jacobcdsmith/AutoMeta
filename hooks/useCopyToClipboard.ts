import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = useCallback(async (text: string, successMessage?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      toast.success(successMessage || 'Copied to clipboard!', {
        duration: 2000,
      });

      // Reset after 2 seconds
      setTimeout(() => setCopiedText(null), 2000);

      return true;
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast.error('Failed to copy to clipboard');
      return false;
    }
  }, []);

  return { copy, copiedText };
}
