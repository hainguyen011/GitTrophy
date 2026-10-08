// ANSI 256 and 24-bit RGB Color Utilities for Cyberpunk Terminal Aesthetics

const isColorSupported = !process.env.NO_COLOR && (process.stdout.isTTY || process.env.FORCE_COLOR);

function wrap(start: string, end: string) {
  return (text: string | number) => (isColorSupported ? `${start}${text}${end}` : String(text));
}

export const c = {
  reset: wrap('\x1b[0m', '\x1b[0m'),
  bold: wrap('\x1b[1m', '\x1b[22m'),
  dim: wrap('\x1b[2m', '\x1b[22m'),
  italic: wrap('\x1b[3m', '\x1b[23m'),
  underline: wrap('\x1b[4m', '\x1b[24m'),

  // Standard Colors
  black: wrap('\x1b[30m', '\x1b[39m'),
  red: wrap('\x1b[31m', '\x1b[39m'),
  green: wrap('\x1b[32m', '\x1b[39m'),
  yellow: wrap('\x1b[33m', '\x1b[39m'),
  blue: wrap('\x1b[34m', '\x1b[39m'),
  magenta: wrap('\x1b[35m', '\x1b[39m'),
  cyan: wrap('\x1b[36m', '\x1b[39m'),
  white: wrap('\x1b[37m', '\x1b[39m'),
  gray: wrap('\x1b[90m', '\x1b[39m'),

  // Cyberpunk & Hawl Neon Accents
  neonGreen: wrap('\x1b[38;2;57;255;20m', '\x1b[39m'),
  neonCyan: wrap('\x1b[38;2;0;240;255m', '\x1b[39m'),
  neonPink: wrap('\x1b[38;2;255;0;127m', '\x1b[39m'),
  neonGold: wrap('\x1b[38;2;255;215;0m', '\x1b[39m'),
  neonPurple: wrap('\x1b[38;2;170;0;255m', '\x1b[39m'),
  darkBg: wrap('\x1b[48;2;15;15;20m', '\x1b[49m'),
  cardBg: wrap('\x1b[48;2;25;28;36m', '\x1b[49m'),
  crimson: wrap('\x1b[38;2;220;20;60m', '\x1b[39m'),
};
