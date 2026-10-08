import { resolveGitHubToken } from './core/auth.js';
import { TrophyHunterEngine, HuntConfiguration } from './orchestrator/engine.js';
import { printBanner } from './ui/banner.js';
import { Logger } from './ui/logger.js';
import { c } from './ui/colors.js';

function parseArgs(): {
  help: boolean;
  token?: string;
  command: 'hunt' | 'recon';
  config: HuntConfiguration;
} {
  const args = process.argv.slice(2);
  const result = {
    help: false,
    token: undefined as string | undefined,
    command: 'hunt' as 'hunt' | 'recon',
    config: {
      badges: ['all'],
      sharkCount: 2,
      galaxyCount: 2,
      keepSandbox: false,
    } as HuntConfiguration,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === '--help' || arg === '-h' || arg === 'help') {
      result.help = true;
    } else if (arg === 'recon' || arg === 'scan') {
      result.command = 'recon';
    } else if (arg === '--token' || arg === '-t') {
      result.token = args[++i];
    } else if (arg === '--badges' || arg === '-b') {
      const val = args[++i];
      if (val) result.config.badges = val.split(',').map((s) => s.trim().toLowerCase());
    } else if (arg === '--shark-count') {
      result.config.sharkCount = parseInt(args[++i] || '2', 10);
    } else if (arg === '--shark-tier') {
      const tier = (args[++i] || '').toLowerCase();
      result.config.sharkCount = tier === 'gold' || tier === 'apex' ? 1024 : tier === 'silver' ? 128 : tier === 'bronze' ? 16 : 2;
    } else if (arg === '--galaxy-count') {
      result.config.galaxyCount = parseInt(args[++i] || '2', 10);
    } else if (arg === '--galaxy-tier') {
      const tier = (args[++i] || '').toLowerCase();
      result.config.galaxyCount =
        tier === 'diamond' ? 32 : tier === 'gold' ? 16 : tier === 'silver' ? 8 : 2;
    } else if (arg === '--pair-count') {
      result.config.pairCount = parseInt(args[++i] || '1', 10);
    } else if (arg === '--pair-tier') {
      const tier = (args[++i] || '').toLowerCase();
      result.config.pairCount = tier === 'gold' ? 48 : tier === 'silver' ? 24 : tier === 'bronze' ? 10 : 1;
    } else if (arg === '--helper-token') {
      result.config.helperToken = args[++i];
    } else if (arg === '--coauthor-email') {
      result.config.coAuthorEmail = args[++i];
    } else if (arg === '--max-all') {
      result.config.sharkCount = 128; // Pull Shark Gold
      result.config.pairCount = 48; // Pair Extraordinaire Gold
      result.config.galaxyCount = 32; // Galaxy Brain Diamond
    } else if (arg === '--repo' || arg === '-r') {
      result.config.repoName = args[++i];
      result.config.keepSandbox = true; // Never delete custom existing repo
    } else if (arg === '--keep') {
      result.config.keepSandbox = true;
    }
  }

  return result;
}

function showHelp(): void {
  printBanner();
  console.log(`  ${c.bold('USAGE:')}`);
  console.log(`    ${c.neonGreen('npx tsx src/index.ts')} ${c.yellow('[OPTIONS]')}`);
  console.log(`    ${c.neonGreen('npm run hunt')} -- ${c.yellow('[OPTIONS]')}\n`);

  console.log(`  ${c.bold('COMMANDS:')}`);
  console.log(`    ${c.cyan('hunt')}                 Execute automated trophy hunt (default)`);
  console.log(`    ${c.cyan('recon')}                Perform reconnaissance scan on target profile only\n`);

  console.log(`  ${c.bold('OPTIONS:')}`);
  console.log(`    ${c.yellow('-t, --token <pat>')}          GitHub Personal Access Token (classic with repo,write:discussion)`);
  console.log(`    ${c.yellow('-r, --repo <name>')}          Target existing repository instead of auto-creating one`);
  console.log(`    ${c.yellow('-b, --badges <list>')}        Specific badges to hunt (comma separated):`);
  console.log(`                             ${c.dim('quickdraw, yolo, pair, shark, galaxy, all (default)')}`);
  console.log(`    ${c.yellow('--max-all')}                  Aim for maximum tiers: Pull Shark Gold (128 PRs) & Pair Gold (48 PRs)`);
  console.log(`    ${c.yellow('--shark-tier <tier>')}        Target tier for Pull Shark: ${c.dim('bronze (2 PRs), silver (16), gold (128)')}`);
  console.log(`    ${c.yellow('--pair-tier <tier>')}         Target tier for Pair Extraordinaire: ${c.dim('bronze (10), silver (24), gold (48)')}`);
  console.log(`    ${c.yellow('--galaxy-tier <tier>')}       Target tier for Galaxy Brain: ${c.dim('bronze (2), silver (8), gold (16), diamond (32)')}`);
  console.log(`    ${c.yellow('--helper-token <pat>')}       Secondary account token to bypass Galaxy Brain anti-cheat`);
  console.log(`    ${c.yellow('--keep')}                     Retain the sandbox repository without deleting it`);
  console.log(`    ${c.yellow('-h, --help')}                 Display this tactical manual\n`);

  console.log(`  ${c.bold('EXAMPLES:')}`);
  console.log(`    ${c.gray('$')} ${c.neonCyan('npm run hunt')}                                ${c.dim('# Hunt all badges (instant baseline)')}`);
  console.log(`    ${c.gray('$')} ${c.neonCyan('npm run hunt -- --shark-tier silver')}         ${c.dim('# Hunt with Pull Shark Silver (16 PRs)')}`);
  console.log(`    ${c.gray('$')} ${c.neonCyan('npm run hunt -- --badges quickdraw,yolo')}      ${c.dim('# Hunt only Quickdraw and YOLO')}`);
  console.log(`    ${c.gray('$')} ${c.neonCyan('npm run hunt -- recon')}                        ${c.dim('# Scan profile only')}\n`);
}

async function main(): Promise<void> {
  const { help, token: cliToken, command, config } = parseArgs();

  if (help) {
    showHelp();
    process.exit(0);
  }

  try {
    const token = await resolveGitHubToken(cliToken);
    const engine = new TrophyHunterEngine(token);

    if (command === 'recon') {
      const client = (engine as any).client;
      const user = await client.authenticate();
      printBanner(user.login);
      const recon = (engine as any).recon;
      await recon.scanProfile(user.login);
      process.exit(0);
    }

    config.helperToken = config.helperToken || process.env.HELPER_TOKEN || process.env.GH_HELPER_TOKEN;

    await engine.runHunt(config);
  } catch (err) {
    Logger.error('Fatal execution failure in GitTrophy Hunter Engine:', err);
    process.exit(1);
  }
}

main();
