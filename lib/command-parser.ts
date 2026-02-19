export interface Command {
  type: 'theme' | 'export' | 'help' | 'clear';
  args: string[];
  description: string;
}

const COMMANDS: Command[] = [
  { type: 'theme', args: ['dark', 'light'], description: 'Switch theme' },
  { type: 'export', args: ['json', 'md'], description: 'Export results' },
  { type: 'help', args: [], description: 'Show keyboard shortcuts' },
  { type: 'clear', args: [], description: 'Clear results and URL' },
];

export function parseCommand(input: string): { type: string; args: string[] } | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith(':')) return null;

  const parts = trimmed.slice(1).split(/\s+/);
  const name = parts[0]?.toLowerCase();
  const args = parts.slice(1);

  const cmd = COMMANDS.find((c) => c.type === name);
  if (!cmd) return null;

  return { type: cmd.type, args };
}

export function getCommandSuggestions(partial: string): Command[] {
  const trimmed = partial.trim();
  if (!trimmed.startsWith(':')) return [];

  const typed = trimmed.slice(1).toLowerCase();
  if (!typed) return COMMANDS;

  return COMMANDS.filter(
    (cmd) => cmd.type.startsWith(typed) || `:${cmd.type}`.startsWith(trimmed.toLowerCase())
  );
}
