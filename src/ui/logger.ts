import { c } from './colors.js';

export class Logger {
  private static getTimestamp(): string {
    const now = new Date();
    return now.toTimeString().split(' ')[0]!;
  }

  static info(msg: string): void {
    console.log(`  ${c.dim(`[${this.getTimestamp()}]`)} ${c.blue('[INFO]')} ${msg}`);
  }

  static success(msg: string): void {
    console.log(`  ${c.dim(`[${this.getTimestamp()}]`)} ${c.neonGreen('[OK]')} ${c.neonGreen(msg)}`);
  }

  static warn(msg: string): void {
    console.log(`  ${c.dim(`[${this.getTimestamp()}]`)} ${c.yellow('[WARN]')} ${c.yellow(msg)}`);
  }

  static error(msg: string, err?: unknown): void {
    console.error(`  ${c.dim(`[${this.getTimestamp()}]`)} ${c.crimson('[ERR]')} ${c.crimson(msg)}`);
    if (err && err instanceof Error) {
      console.error(`    ${c.dim(err.stack || err.message)}`);
    }
  }

  static payload(title: string, detail: string): void {
    console.log(
      `  ${c.dim(`[${this.getTimestamp()}]`)} ${c.neonPurple('[PAYLOAD]')} ${c.bold(
        title
      )} ${c.dim('->')} ${detail}`
    );
  }

  static progress(current: number, total: number, label: string): void {
    const width = 24;
    const progressRatio = Math.min(1, current / total);
    const filled = Math.round(width * progressRatio);
    const empty = width - filled;
    const bar = `${c.neonGreen('='.repeat(filled))}${c.dim('-'.repeat(empty))}`;
    const pct = `${(progressRatio * 100).toFixed(0)}%`.padStart(4);

    process.stdout.write(
      `\r  ${c.cyan('[*]')} [${bar}] ${c.bold(pct)} ${c.gray(`(${current}/${total})`)} ${c.dim(label)}  `
    );

    if (current >= total) {
      process.stdout.write('\n');
    }
  }
}
