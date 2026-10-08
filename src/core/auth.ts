import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { c } from '../ui/colors.js';
import { Logger } from '../ui/logger.js';

export function loadEnvFile(envPath = '.env'): void {
  const fullPath = path.resolve(process.cwd(), envPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

export async function resolveGitHubToken(cliToken?: string): Promise<string> {
  // 1. Check CLI Argument
  if (cliToken && cliToken.trim().length > 0) {
    return cliToken.trim();
  }

  // 2. Load .env
  loadEnvFile();

  // 3. Check environment variables
  const envToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (envToken && envToken.trim().length > 0) {
    return envToken.trim();
  }

  // 4. Interactive prompt
  return new Promise<string>((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(`\n  ${c.neonPink('[!] GITHUB PERSONAL ACCESS TOKEN REQUIRED')}`);
    console.log(`  ${c.dim('Scopes needed: repo, write:discussion, workflow (classic PAT) or administration/contents/issues/discussions/pr (fine-grained)')}`);
    console.log(`  ${c.dim('Create token at: https://github.com/settings/tokens')}\n`);

    rl.question(`  ${c.cyan('Enter GitHub Token')} ${c.gray('->')} `, (answer) => {
      rl.close();
      const token = answer.trim();
      if (!token) {
        Logger.error('No GitHub token provided. Aborting hunt.');
        process.exit(1);
      }
      resolve(token);
    });
  });
}
