import { GitHubClient } from './github-client.js';
import { Logger } from '../ui/logger.js';
import { c } from './../ui/colors.js';

export interface BadgeStatus {
  id: string;
  name: string;
  tier: string;
  maxTier: string;
  unlocked: boolean;
  actionRequired: string;
}

export class Reconnaissance {
  private client: GitHubClient;

  constructor(client: GitHubClient) {
    this.client = client;
  }

  public async scanProfile(username: string): Promise<BadgeStatus[]> {
    Logger.info(`Scanning profile @${username} for active trophies and achievements...`);

    // Standard list of huntable GitHub Achievements
    const targets: BadgeStatus[] = [
      {
        id: 'quickdraw',
        name: 'Quickdraw',
        tier: 'Default',
        maxTier: 'Default',
        unlocked: false,
        actionRequired: 'Close an Issue or Pull Request within 5 minutes of opening.',
      },
      {
        id: 'yolo',
        name: 'YOLO',
        tier: 'Default',
        maxTier: 'Default',
        unlocked: false,
        actionRequired: 'Merge a Pull Request without code review.',
      },
      {
        id: 'pair-extraordinaire',
        name: 'Pair Extraordinaire',
        tier: 'Default',
        maxTier: 'Default',
        unlocked: false,
        actionRequired: 'Co-author a commit in a merged Pull Request.',
      },
      {
        id: 'pull-shark',
        name: 'Pull Shark',
        tier: 'Bronze (x2)',
        maxTier: 'Gold (x128)',
        unlocked: false,
        actionRequired: 'Merge pull requests (Bronze: 2, Silver: 16, Gold: 128).',
      },
      {
        id: 'galaxy-brain',
        name: 'Galaxy Brain',
        tier: 'Bronze (x2)',
        maxTier: 'Diamond (x32)',
        unlocked: false,
        actionRequired: 'Have accepted answers in GitHub Discussions (2, 8, 16, 32).',
      },
      {
        id: 'public-sponsor',
        name: 'Public Sponsor',
        tier: 'Default',
        maxTier: 'Default',
        unlocked: false,
        actionRequired: 'Sponsor an open-source maintainer on GitHub Sponsors.',
      },
      {
        id: 'starstruck',
        name: 'Starstruck',
        tier: 'Bronze (x16)',
        maxTier: 'Gold (x512)',
        unlocked: false,
        actionRequired: 'Own a repository with stars (Bronze: 16, Silver: 128, Gold: 512).',
      },
    ];

    // Attempt to inspect public achievements from GitHub profile HTML
    try {
      const profileUrl = `https://github.com/${username}`;
      const res = await fetch(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        },
      });

      if (res.ok) {
        const html = await res.text();
        for (const t of targets) {
          const regex = new RegExp(`achievements/${t.id}|alt="Achievement: ${t.name}`, 'i');
          if (regex.test(html)) {
            t.unlocked = true;
          }
        }
      }
    } catch {
      // Non-critical if scrape fails
    }

    this.renderReconReport(username, targets);
    return targets;
  }

  private renderReconReport(username: string, targets: BadgeStatus[]): void {
    console.log(`\n  ${c.neonCyan('+-- RECONNAISSANCE REPORT')} ${c.gray(`[@${username}]`)}`);
    console.log(`  ${c.neonCyan('|')}`);
    for (const badge of targets) {
      const stateBadge = badge.unlocked
        ? c.neonGreen('[ ACQUIRED ]')
        : c.yellow('[ HUNTABLE ]');
      console.log(
        `  ${c.neonCyan('|')}  ${c.bold(badge.name.padEnd(22))} ${c.dim(
          badge.tier.padEnd(14)
        )} ${stateBadge} ${c.dim(`- ${badge.actionRequired}`)}`
      );
    }
    console.log(`  ${c.neonCyan('|')}`);
    console.log(`  ${c.neonCyan('+-- ALL VECTORS MAPPED & READY FOR INFILTRATION')}\n`);
  }
}
