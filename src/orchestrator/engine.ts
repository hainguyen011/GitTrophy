import { GitHubClient } from '../core/github-client.js';
import { SandboxOrchestrator } from './sandbox.js';
import { Reconnaissance } from '../core/recon.js';
import { QuickdrawExploit } from '../exploits/quickdraw.js';
import { YoloExploit } from '../exploits/yolo.js';
import { PairExtraordinaireExploit } from '../exploits/pair-extraordinaire.js';
import { PullSharkExploit } from '../exploits/pull-shark.js';
import { GalaxyBrainExploit } from '../exploits/galaxy-brain.js';
import { ExploitResult } from '../exploits/base-exploit.js';
import { printBanner, printTrophyCard } from '../ui/banner.js';
import { Logger } from '../ui/logger.js';
import { c } from '../ui/colors.js';

export interface HuntConfiguration {
  badges?: string[]; // 'all' or specific: ['quickdraw', 'yolo', 'pair', 'shark', 'galaxy']
  sharkCount?: number; // 2, 16, 128
  pairCount?: number; // 1, 10, 24, 48
  galaxyCount?: number; // 2, 8, 16, 32
  helperToken?: string;
  coAuthorName?: string;
  coAuthorEmail?: string;
  keepSandbox?: boolean;
  cleanOnly?: boolean;
  repoName?: string;
}

export class TrophyHunterEngine {
  private client: GitHubClient;
  private sandboxMgr: SandboxOrchestrator;
  private recon: Reconnaissance;

  constructor(token: string) {
    this.client = new GitHubClient(token);
    this.sandboxMgr = new SandboxOrchestrator(this.client);
    this.recon = new Reconnaissance(this.client);
  }

  public async runHunt(config: HuntConfiguration = {}): Promise<ExploitResult[]> {
    const startTime = Date.now();

    // 1. Authenticate
    const user = await this.client.authenticate();
    printBanner(user.login);

    // 2. Reconnaissance
    await this.recon.scanProfile(user.login);

    // 3. Provision Sandbox
    const sandbox = await this.sandboxMgr.provisionSandbox(config.repoName);
    Logger.info(`Vault established at ${c.cyan(sandbox.htmlUrl)}`);

    const results: ExploitResult[] = [];
    const badgesToHunt = config.badges || ['all'];
    const isAll = badgesToHunt.includes('all');

    console.log(`\n  ${c.neonGreen('[+] INITIATING AUTONOMOUS TROPHY HARVEST SEQUENCE')}`);
    const sharkTarget = config.sharkCount || 2;
    const pairTarget = config.pairCount || 1;
    const galaxyTarget = config.galaxyCount || 2;
    Logger.info(`Target quotas armed: Shark [${c.bold(sharkTarget.toString())} PRs] | Pair [${c.bold(pairTarget.toString())} PRs] | Galaxy [${c.bold(galaxyTarget.toString())} answers]\n`);

    // Exploit 1: Quickdraw
    if (isAll || badgesToHunt.includes('quickdraw')) {
      const quickdraw = new QuickdrawExploit(this.client, sandbox);
      const res = await quickdraw.execute();
      results.push(res);
      await this.sleep(1500);
    }

    // Exploit 2: YOLO
    if (isAll || badgesToHunt.includes('yolo')) {
      const yolo = new YoloExploit(this.client, sandbox);
      const res = await yolo.execute();
      results.push(res);
      await this.sleep(1500);
    }

    // Exploit 3: Pair Extraordinaire
    if (isAll || badgesToHunt.includes('pair') || badgesToHunt.includes('pair-extraordinaire')) {
      const pair = new PairExtraordinaireExploit(this.client, sandbox);
      const res = await pair.execute({
        count: config.pairCount || 1,
        coAuthorName: config.coAuthorName,
        coAuthorEmail: config.coAuthorEmail,
      });
      results.push(res);
      await this.sleep(1500);
    }

    // Exploit 4: Pull Shark
    if (isAll || badgesToHunt.includes('shark') || badgesToHunt.includes('pull-shark')) {
      const shark = new PullSharkExploit(this.client, sandbox);
      const res = await shark.execute({ targetCount: config.sharkCount || 2 });
      results.push(res);
      await this.sleep(1500);
    }

    // Exploit 5: Galaxy Brain
    if (isAll || badgesToHunt.includes('galaxy') || badgesToHunt.includes('galaxy-brain')) {
      const galaxy = new GalaxyBrainExploit(this.client, sandbox);
      const res = await galaxy.execute({
        targetCount: config.galaxyCount || 2,
        helperToken: config.helperToken,
      });
      results.push(res);
      await this.sleep(1500);
    }

    // 4. Post-Hunt Teardown / Retention
    if (config.keepSandbox) {
      Logger.info(`Sandbox retained for proof of concept: ${c.cyan(sandbox.htmlUrl)}`);
    } else {
      Logger.info('Post-hunt forensic sanitization initiated...');
      await this.sandboxMgr.destroySandbox();
    }

    // 5. Render Final Trophy Showcase
    this.renderTrophyShowcase(results, Date.now() - startTime);

    return results;
  }

  private renderTrophyShowcase(results: ExploitResult[], totalDurationMs: number): void {
    console.log(`\n  ${c.neonGold('+-----------------------------------------------------------------------------+')}`);
    console.log(`  ${c.neonGold('|')}                     ${c.bold('GITTROPHY HARVEST TELEMETRY REPORT')}                    ${c.neonGold('|')}`);
    console.log(`  ${c.neonGold('+-----------------------------------------------------------------------------+')}`);

    for (const res of results) {
      const status = res.success ? 'UNLOCKED' : 'FAILED';
      printTrophyCard(res.badgeName, res.tier, status, `${(res.durationMs / 1000).toFixed(1)}s`);
    }

    console.log(`  ${c.neonGold('+-----------------------------------------------------------------------------+')}`);
    const unlockedCount = results.filter((r) => r.success).length;
    console.log(
      `  ${c.neonGold('|')}  Total Trophies Claimed: ${c.neonGreen(
        `${unlockedCount}/${results.length}`
      )} | Total Hunt Time: ${c.cyan(`${(totalDurationMs / 1000).toFixed(1)}s`)}             ${c.neonGold('|')}`
    );
    console.log(`  ${c.neonGold('+-----------------------------------------------------------------------------+')}\n`);

    console.log(`  ${c.dim('Note: GitHub background achievement indexers may take 2-10 minutes to reflect badges')}`);
    console.log(`  ${c.dim('Check your profile at:')} ${c.neonCyan(`https://github.com/${this.client.user?.login}?tab=achievements`)}\n`);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
