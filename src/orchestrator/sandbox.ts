import crypto from 'node:crypto';
import { GitHubClient } from '../core/github-client.js';
import { Logger } from '../ui/logger.js';
import { c } from '../ui/colors.js';

export interface SandboxInfo {
  owner: string;
  repo: string;
  defaultBranch: string;
  htmlUrl: string;
}

export class SandboxOrchestrator {
  private client: GitHubClient;
  private currentSandbox?: SandboxInfo;

  constructor(client: GitHubClient) {
    this.client = client;
  }

  public async provisionSandbox(customName?: string, isPrivate = false): Promise<SandboxInfo> {
    if (!this.client.user) {
      await this.client.authenticate();
    }
    const owner = this.client.user!.login;
    const randomHex = crypto.randomBytes(3).toString('hex');
    const repoName = customName || `gittrophy-vault-${randomHex}`;

    Logger.info(`Provisioning isolated sandbox repository: ${c.bold(`${owner}/${repoName}`)}...`);

    let created: any;
    let repoExists = false;

    if (customName) {
      try {
        const existing = await this.client.request(`/repos/${owner}/${repoName}`);
        if (existing.status === 200) {
          repoExists = true;
          created = existing.data;
          Logger.info(`Using existing repository: ${c.bold(`${owner}/${repoName}`)}`);
        }
      } catch {
        repoExists = false;
      }
    }

    if (!repoExists) {
      try {
        created = await this.client.createRepository(
          repoName,
          'GitTrophy Autonomous Badge Hunting Vault - Ephemeral Security Lab',
          isPrivate
        );
      } catch (err: any) {
        if (err.message?.includes('403') || err.message?.includes('Resource not accessible')) {
          throw new Error(
            `Token hiện tại không có quyền tạo repo mới (POST /user/repos).\n` +
            `    ➔ Khắc phục 1: Tạo Token Classic (ghp_...) có quyền 'repo' và 'write:discussion' tại:\n` +
            `       https://github.com/settings/tokens/new?scopes=repo,write:discussion\n` +
            `    ➔ Khắc phục 2: Tạo sẵn 1 repo rỗng trên GitHub (ví dụ: gittrophy-vault) rồi chạy:\n` +
            `       npm run hunt -- --repo gittrophy-vault`
          );
        }
        throw err;
      }
    }

    // Give GitHub 2 seconds to initialize git tree
    await new Promise((r) => setTimeout(r, 2000));

    // Ensure initial commit & file exists
    try {
      await this.client.createOrUpdateFile(
        owner,
        repoName,
        'INFILTRATION.md',
        `# GitTrophy Vault\n\nTarget: ${owner}\nInitialized: ${new Date().toISOString()}\nOperator: Hawl (VOD-HAC-9X0F2E)\n`,
        'Initial Hawl Telemetry Beacon',
        'main'
      );
    } catch {
      // already initialized
    }

    // Enable Discussions via REST API patch
    try {
      await this.client.request(`/repos/${owner}/${repoName}`, {
        method: 'PATCH',
        body: JSON.stringify({ has_discussions: true }),
      });
      Logger.success('Discussions subsystem enabled on sandbox repository.');
    } catch (err) {
      Logger.warn(`Discussions enable skipped: ${err instanceof Error ? err.message : String(err)}`);
    }

    this.currentSandbox = {
      owner,
      repo: repoName,
      defaultBranch: 'main',
      htmlUrl: created.html_url || `https://github.com/${owner}/${repoName}`,
    };

    Logger.success(`Sandbox armed at: ${c.cyan(this.currentSandbox.htmlUrl)}`);
    return this.currentSandbox;
  }

  public async destroySandbox(): Promise<boolean> {
    if (!this.currentSandbox) return false;
    const { owner, repo } = this.currentSandbox;
    Logger.info(`Initiating self-destruction sequence for sandbox ${owner}/${repo}...`);
    const success = await this.client.deleteRepository(owner, repo);
    if (success) {
      Logger.success(`Sandbox ${owner}/${repo} purged without leaving forensics.`);
      this.currentSandbox = undefined;
    }
    return success;
  }

  public getSandbox(): SandboxInfo | undefined {
    return this.currentSandbox;
  }
}
