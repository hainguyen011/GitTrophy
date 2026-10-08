import { c } from './colors.js';

export function printBanner(targetUser?: string): void {
  const logo = `
  ██████╗ ██╗████████╗████████╗██████╗  ██████╗ ██████╗ ██╗  ██╗██╗   ██╗
 ██╔════╝ ██║╚══██╔══╝╚══██╔══╝██╔══██╗██╔═══██╗██╔══██╗██║  ██║╚██╗ ██╔╝
 ██║  ███╗██║   ██║      ██║   ██████╔╝██║   ██║██████╔╝███████║ ╚████╔╝ 
 ██║   ██║██║   ██║      ██║   ██╔══██╗██║   ██║██╔═══╝ ██╔══██║  ╚██╔╝  
 ╚██████╔╝██║   ██║      ██║   ██║  ██║╚██████╔╝██║     ██║  ██║   ██║   
  ╚═════╝ ╚═╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝  ╚═╝   ╚═╝   
`;

  console.log(c.neonCyan(logo));
  console.log(
    c.dim('  -----------------------------------------------------------------------------')
  );
  console.log(
    `  ${c.neonGreen('[HAWL BLACK HAT ENGINE]')} ${c.gray('::')} ${c.bold(
      'AUTONOMOUS GITHUB TROPHY & BADGE HUNTER'
    )} ${c.gray('v1.0.0')}`
  );
  console.log(
    `  ${c.gray('OPERATOR:')} ${c.neonPurple('VOD-HAC-9X0F2E')} ${c.gray(
      '| STATUS:'
    )} ${c.neonGreen('ARMED & OPERATIONAL')}`
  );
  if (targetUser) {
    console.log(
      `  ${c.gray('TARGET PROFILE:')} ${c.neonGold(`@${targetUser}`)}`
    );
  }
  console.log(
    c.dim('  -----------------------------------------------------------------------------\n')
  );
}

export function printTrophyCard(
  name?: string,
  tier?: string,
  status: 'UNLOCKED' | 'ALREADY_OWNED' | 'FAILED' | 'SKIPPED' = 'UNLOCKED',
  details?: string
): void {
  const safeName = String(name || 'Unknown Badge');
  const safeTier = String(tier || 'Default');

  const statusColor =
    status === 'UNLOCKED'
      ? c.neonGreen
      : status === 'ALREADY_OWNED'
      ? c.neonCyan
      : status === 'FAILED'
      ? c.crimson
      : c.gray;

  const statusText =
    status === 'UNLOCKED'
      ? '[ UNLOCKED ]'
      : status === 'ALREADY_OWNED'
      ? '[ ACQUIRED ]'
      : status === 'FAILED'
      ? '[ FAILED   ]'
      : '[ SKIPPED  ]';

  console.log(
    `  ${c.bold(safeName.padEnd(24))} ${c.yellow(safeTier.padEnd(14))} ${statusColor(
      statusText
    )} ${details ? c.dim(`(${details})`) : ''}`
  );
}
