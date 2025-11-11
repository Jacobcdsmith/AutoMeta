import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  callback: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[], enabled: boolean = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = !shortcut.ctrlKey || event.ctrlKey;
        const shiftMatches = !shortcut.shiftKey || event.shiftKey;
        const altMatches = !shortcut.altKey || event.altKey;
        const metaMatches = !shortcut.metaKey || event.metaKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

// Common shortcuts configuration
export const getCommonShortcuts = (
  onOpenConfig: () => void,
  onGenerateContent?: () => void,
  onToggleView?: () => void
): ShortcutConfig[] => [
  {
    key: ',',
    ctrlKey: true,
    callback: onOpenConfig,
    description: 'Open Settings',
  },
  {
    key: 'k',
    ctrlKey: true,
    callback: () => {
      // Command palette (future enhancement)
      console.log('Command palette');
    },
    description: 'Command Palette',
  },
  ...(onGenerateContent
    ? [
        {
          key: 'Enter',
          ctrlKey: true,
          callback: onGenerateContent,
          description: 'Generate Content',
        },
      ]
    : []),
  ...(onToggleView
    ? [
        {
          key: 'Tab',
          ctrlKey: true,
          callback: onToggleView,
          description: 'Toggle View',
        },
      ]
    : []),
  {
    key: '/',
    ctrlKey: true,
    callback: () => {
      // Show shortcuts help
      console.log('Show shortcuts');
    },
    description: 'Show Shortcuts',
  },
];
