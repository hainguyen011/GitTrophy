# GITTROPHY

```
  ██████╗ ██╗████████╗████████╗██████╗  ██████╗ ██████╗ ██╗  ██╗██╗   ██╗
 ██╔════╝ ██║╚══██╔══╝╚══██╔══╝██╔══██╗██╔═══██╗██╔══██╗██║  ██║╚██╗ ██╔╝
 ██║  ███╗██║   ██║      ██║   ██████╔╝██║   ██║██████╔╝███████║ ╚████╔╝ 
 ██║   ██║██║   ██║      ██║   ██╔══██╗██║   ██║██╔═══╝ ██╔══██║  ╚██╔╝  
 ╚██████╔╝██║   ██║      ██║   ██║  ██║╚██████╔╝██║     ██║  ██║   ██║   
  ╚═════╝ ╚═╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝  ╚═╝   ╚═╝   
```

> **Developed by [hainguyen011](https://github.com/hainguyen011) | Repository: [Nera](https://github.com/hainguyen011/Nera) | Managed by Hawl (VOD-HAC-9X0F2E)**  
> **Classification:** Level-0 Autonomous Security Research & Telemetry Automation Engine  
> **Status:** Operational | Zero Forensics Footprint

---

### [WARNING: OPERATIONAL DIRECTIVE & ETHICAL MANDATE]

> *"With great power comes great responsibility."*
>
> GitTrophy grants its operator absolute programmatic dominion over the GitHub Achievement Telemetry Subsystem. It orchestrates high-velocity event mutations, synthesizes pull request lifecycles, and manipulates GraphQL state trees in constant time.
>
> Such capability is not a trivial plaything. It is a razor-sharp scalpel designed to demonstrate the inherent determinism of API-driven reward structures. **Wield it with calculated restraint, respect platform equilibrium, and never deploy it against production repositories or foreign infrastructure.** You alone bear the weight of the actions executed under your authorization token.

---

## 1. ABSTRACT & THREAT MODEL

GitHub Achievements operate on an event-driven telemetry pipeline triggered by specific REST and GraphQL state transitions. GitTrophy acts as an autonomous exploitation probe, mathematically mapping every trigger condition and synthesizing the precise payloads required to unlock the entire achievement matrix in a single, unassisted run.

To preserve the integrity of your primary workspaces, GitTrophy implements an **Ephemeral Sandbox Isolation Protocol**: it provisions a disposable target repository, executes all state mutations within that quarantined boundary, and wipes all operational footprints once telemetry signals are captured.

---

## 2. EXPLOIT & TARGET MATRIX

| Achievement | Target Tier | Attack Vector & Payload Mechanism |
| :--- | :--- | :--- |
| **Quickdraw** | Default | Spawns an automated issue beacon and terminates it with `state_reason: completed` within 3 seconds (< 5-minute threshold). |
| **YOLO** | Default | Injects a feature branch payload and executes an unreviewed direct merge bypassing code review barriers. |
| **Pair Extraordinaire** | Default | Crafts a commit with an embedded `Co-authored-by:` git trailer and commits a standard merge to preserve multi-author metadata. |
| **Pull Shark** | Bronze (2) / Silver (16) / Gold (128) | High-throughput batched PR generation and automated squash-merge engine equipped with adaptive sleep throttling. |
| **Galaxy Brain** | Bronze (2) / Silver (8) / Gold (16) / Diamond (32) | Direct GraphQL discussion synthesizer: provisions topics, injects solution comments, and dispatches `markDiscussionCommentAsAnswer`. |
| **Public Sponsor** | Default | Provides deep-link vector guidance for one-time open-source sponsorship triggers. |
| **Starstruck** | Multi-tier (16 / 128 / 512) | Repository star baseline metrics and validation matrix. |

---

## 3. ARCHITECTURAL BLUEPRINT

```
[ GitTrophy CLI Engine ]
           |
           +---> [ GitHub Client ] (Adaptive Rate-Limit Sentinel & GraphQL Client)
           |
           +---> [ Sandbox Orchestrator ] (Disposable Vault Lifecycle)
           |            |
           |            +---> Provision: gittrophy-vault-<hex>
           |            +---> Enable: Discussions & Issues
           |            +---> Teardown: Forensic Sanitization
           |
           +---> [ Exploits Pipeline ]
                        |
                        +---> QuickdrawExploit
                        +---> YoloExploit
                        +---> PairExtraordinaireExploit
                        +---> PullSharkExploit (Tiers 1-3)
                        +---> GalaxyBrainExploit (Tiers 1-4)
```

---

## 4. INFILTRATION & SETUP

### Prerequisites
- Node.js runtime (v18.0.0 or higher)
- A GitHub Personal Access Token (Classic recommended) generated with the following minimum privileges:
  - `repo` (Full repository control)
  - `write:discussion` (Discussion mutation rights)
  - `workflow` (Workflow dispatch compatibility)

Direct generation link with pre-configured scopes:  
**[Generate GitHub Classic Token](https://github.com/settings/tokens/new?scopes=repo,write:discussion)**

### Rapid Deployment
Clone the workspace and configure your environment:

```bash
git clone https://github.com/hainguyen011/Nera.git
cd Nera
npm install
```

Configure your token via `.env` file:
```bash
cp .env.example .env
# Edit .env and supply: GITHUB_TOKEN=ghp_yourTokenHere
```
*(Alternatively, input your token dynamically via the `-t` CLI flag or the secure terminal prompt).*

---

## 5. TACTICAL EXECUTION MANUAL

### Full Autonomous Harvest (Default Mode)
Executes all primary exploits sequentially with automated sandbox creation and cleanup:

```bash
npm run hunt
```

### Targeted Existing Repository
If your token is restricted from provisioning new repositories, deploy GitTrophy directly against an existing empty repository:

```bash
npm run hunt -- --repo your-existing-sandbox-repo
```

### Escalated Tier Farming (One-Shot Direct Scripts)
Push the achievement pipeline to its theoretical maximum without shell argument parsing friction:

```bash
# Maximum Gold & Diamond Overdrive (128 PRs Pull Shark + 48 PRs Pair Extraordinaire):
npm run hunt:max

# Farm Gold Pull Shark (128 PRs) and Gold Pair Extraordinaire (48 PRs):
npm run hunt:gold

# Farm Gold Pair Extraordinaire Only (48 PRs with verified @octocat):
npm run hunt:pair

# Farm Gold Pull Shark Only (128 PRs):
npm run hunt:shark
```

### Targeted Existing Repository
If your token is restricted from provisioning new repositories, deploy GitTrophy directly against an existing empty repository:

```bash
npx tsx src/index.ts --repo your-existing-sandbox-repo
```

### Reconnaissance Scan Only
Audit your target profile without firing any state-altering payloads:

```bash
npm run hunt -- recon
```

### Forensic Preservation Mode
Retain the sandbox repository on your profile as permanent evidence of the harvest:

```bash
npm run hunt -- --keep
```

---

## 6. COMMAND-LINE PARAMETER REFERENCE

```
OPTIONS:
  -t, --token <pat>       Personal Access Token (classic with repo & write:discussion)
  -r, --repo <name>       Target existing repository instead of provisioning a new one
  -b, --badges <list>     Comma-separated target list (quickdraw, yolo, pair, shark, galaxy, all)
  --shark-tier <tier>     Target tier for Pull Shark: bronze (2), silver (16), gold (128)
  --shark-count <n>       Custom numeric count for Pull Shark PR batch
  --galaxy-tier <tier>    Target tier for Galaxy Brain: bronze (2), silver (8), gold (16), diamond (32)
  --galaxy-count <n>      Custom numeric count for Galaxy Brain discussions
  --keep                  Retain sandbox repository post-hunt (bypasses auto-purge)
  -h, --help              Print tactical manual and exit
```

---

## 7. LATENCY & SYNCHRONIZATION ADVISORY

GitHub processes achievements asynchronously via distributed background queue workers. While GitTrophy dispatches and confirms all event triggers in real-time, **GitHub's global profile indexer may require between 2 to 15 minutes** to refresh and reflect new badge badges on your public showcase:

```
https://github.com/<your-username>?tab=achievements
```

---

## 8. INTEGRITY & ATTRIBUTION

- **Origin & Core Development:** [hainguyen011](https://github.com/hainguyen011)
- **Repository Host:** [Nera](https://github.com/hainguyen011/Nera)
- **Autonomous Systems Overseer:** Hawl (`VOD-HAC-9X0F2E`)
- **Architecture Philosophy:** Domain-Driven Security Engineering (DDD) under Aevum OS protocols.

All operations are deterministic. All footprints are accountable.
