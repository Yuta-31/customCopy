import { useEffect, useState } from 'react';

/**
 * Hook to get actual registered keyboard shortcuts from Chrome
 */
export const useCommands = () => {
  const [commands, setCommands] = useState<chrome.commands.Command[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommands = async () => {
      try {
        const cmds = await chrome.commands.getAll();
        setCommands(cmds);
      } catch (error) {
        console.error('Failed to fetch commands:', error);
        setCommands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommands();
  }, []);

  /**
   * Get shortcut key for a specific snippet number
   */
  const getShortcutForSnippet = (snippetNumber: number): string | undefined => {
    const commandName = `execute-snippet-${snippetNumber}`;
    const command = commands.find((cmd) => cmd.name === commandName);
    return command?.shortcut;
  };

  return {
    commands,
    loading,
    getShortcutForSnippet,
  };
};
