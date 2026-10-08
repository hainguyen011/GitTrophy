import { Logger } from '../ui/logger.js';
import { c } from '../ui/colors.js';

export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  name: string | null;
  email: string | null;
  public_repos: number;
  html_url: string;
}

export interface RestResponse<T = any> {
  status: number;
  headers: Headers;
  data: T;
}

export class GitHubClient {
  private token: string;
  private baseUrl = 'https://api.github.com';
  private graphqlUrl = 'https://api.github.com/graphql';
  public user?: GitHubUser;

  constructor(token: string) {
    this.token = token;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    maxRetries = 4
  ): Promise<RestResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${this.token}`);
    headers.set('Accept', 'application/vnd.github+json');
    headers.set('X-GitHub-Api-Version', '2022-11-28');
    headers.set('User-Agent', 'GitTrophy-Hawl-Hunter/1.0');

    let attempt = 0;
    while (attempt < maxRetries) {
      attempt++;
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        // Handle Secondary Rate Limits / Abuse Detection
        if (response.status === 429 || (response.status === 403 && response.headers.get('retry-after'))) {
          const retryAfter = parseInt(response.headers.get('retry-after') || '10', 10);
          Logger.warn(`Secondary rate-limit encountered. Cooling down for ${retryAfter}s (attempt ${attempt}/${maxRetries})...`);
          await this.sleep(retryAfter * 1000);
          continue;
        }

        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : await response.text();

        if (!response.ok) {
          // Check for rate limit in body
          const errorMsg = typeof data === 'object' && data && 'message' in data ? (data as any).message : String(data);
          if (response.status === 403 && errorMsg.includes('secondary rate limit')) {
            const cooldown = attempt * 15;
            Logger.warn(`GitHub secondary rate-limit active. Enforcing ${cooldown}s stealth cool-off...`);
            await this.sleep(cooldown * 1000);
            continue;
          }

          if (attempt >= maxRetries) {
            throw new Error(`GitHub API Error [${response.status}] ${endpoint}: ${errorMsg}`);
          }
          await this.sleep(attempt * 2000);
          continue;
        }

        return {
          status: response.status,
          headers: response.headers,
          data: data as T,
        };
      } catch (err) {
        if (attempt >= maxRetries) {
          throw err;
        }
        await this.sleep(attempt * 1500);
      }
    }

    throw new Error(`Failed request to ${endpoint} after ${maxRetries} attempts.`);
  }

  public async graphql<T = any>(query: string, variables: Record<string, any> = {}): Promise<T> {
    const res = await this.request(this.graphqlUrl, {
      method: 'POST',
      body: JSON.stringify({ query, variables }),
    });

    if (res.data.errors && res.data.errors.length > 0) {
      const msg = res.data.errors.map((e: any) => e.message).join('; ');
      throw new Error(`GraphQL Error: ${msg}`);
    }

    return res.data.data as T;
  }

  public async authenticate(): Promise<GitHubUser> {
    Logger.info('Verifying token authenticity and identity credentials...');
    const res = await this.request<GitHubUser>('/user');
    this.user = res.data;
    Logger.success(`Authenticated as ${c.bold(this.user.login)} (${c.cyan(this.user.name || 'Anonymous Hunter')})`);
    return this.user;
  }

  // --- REST Helpers ---

  public async createRepository(name: string, description: string, isPrivate = true): Promise<any> {
    Logger.payload('Create Sandbox Repo', `${name} (${isPrivate ? 'private' : 'public'})`);
    const res = await this.request('/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: true,
        has_issues: true,
        has_discussions: true,
      }),
    });
    return res.data;
  }

  public async deleteRepository(owner: string, repo: string): Promise<boolean> {
    Logger.payload('Purge Sandbox Repo', `${owner}/${repo}`);
    try {
      await this.request(`/repos/${owner}/${repo}`, {
        method: 'DELETE',
      });
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('admin rights') || msg.includes('403')) {
        Logger.info(`Sandbox retained at ${owner}/${repo} (Token lacks 'delete_repo' scope to auto-purge).`);
      } else {
        Logger.warn(`Could not delete repo ${owner}/${repo}: ${msg}`);
      }
      return false;
    }
  }

  public async getRef(owner: string, repo: string, ref: string): Promise<string> {
    const res = await this.request(`/repos/${owner}/${repo}/git/ref/${ref}`);
    return res.data.object.sha;
  }

  public async createBranch(owner: string, repo: string, branchName: string, fromSha: string): Promise<any> {
    return (
      await this.request(`/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: fromSha,
        }),
      })
    ).data;
  }

  public async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch: string,
    committer?: { name: string; email: string },
    author?: { name: string; email: string }
  ): Promise<any> {
    const body: any = {
      message,
      content: Buffer.from(content).toString('base64'),
      branch,
    };
    if (committer) body.committer = committer;
    if (author) body.author = author;

    const res = await this.request(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return res.data;
  }

  public async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base = 'main',
    body = 'Automated GitTrophy Payload'
  ): Promise<any> {
    const res = await this.request(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        head,
        base,
        body,
      }),
    });
    return res.data;
  }

  public async mergePullRequest(
    owner: string,
    repo: string,
    pullNumber: number,
    commitTitle?: string,
    mergeMethod: 'merge' | 'squash' | 'rebase' = 'squash'
  ): Promise<any> {
    const res = await this.request(`/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {
      method: 'PUT',
      body: JSON.stringify({
        commit_title: commitTitle || `Merge PR #${pullNumber}`,
        merge_method: mergeMethod,
      }),
    });
    return res.data;
  }

  public async createIssue(owner: string, repo: string, title: string, body = ''): Promise<any> {
    const res = await this.request(`/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title, body }),
    });
    return res.data;
  }

  public async closeIssue(owner: string, repo: string, issueNumber: number): Promise<any> {
    const res = await this.request(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
      method: 'PATCH',
      body: JSON.stringify({ state: 'closed', state_reason: 'completed' }),
    });
    return res.data;
  }

  public async getRepositoryNodeId(owner: string, repo: string): Promise<string> {
    const res = await this.request(`/repos/${owner}/${repo}`);
    return res.data.node_id;
  }
}
