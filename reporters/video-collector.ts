import * as fs from 'fs';
import * as path from 'path';
import type { FullConfig, Reporter, TestCase, TestResult } from '@playwright/test/reporter';

// Gom video của mọi test vào một thư mục, đặt tên theo file spec + tên test để dễ ghép video.
// Ví dụ: recordings/03 booking - TC16 Đặt phòng thành công (end-to-end flow).webm
export default class VideoCollector implements Reporter {
  private outputDir: string;
  private specOrder = new Map<string, number>();

  constructor(options: { outputDir?: string } = {}) {
    this.outputDir = options.outputDir ?? 'recordings';
  }

  onBegin(config: FullConfig): void {
    // Đường dẫn tính từ thư mục chứa file config (thư mục gốc project)
    this.outputDir = path.resolve(path.dirname(config.configFile ?? config.rootDir), this.outputDir);
    fs.rmSync(this.outputDir, { recursive: true, force: true });
    fs.mkdirSync(this.outputDir, { recursive: true });
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const video = result.attachments.find((a) => a.name === 'video' && a.path);
    if (!video?.path || !fs.existsSync(video.path)) return;

    const spec = path.basename(test.location.file).replace(/\.spec\.ts$/, '');
    if (!this.specOrder.has(spec)) this.specOrder.set(spec, this.specOrder.size + 1);
    const order = String(this.specOrder.get(spec)).padStart(2, '0');

    // Test đánh dấu test.fail là bug đã biết
    const isKnownBug = test.expectedStatus === 'failed';
    const status = isKnownBug ? ' (BUG)' : result.status === 'passed' ? '' : ` (${result.status.toUpperCase()})`;

    const title = test.title.replace(/:\s*/, ' - ');
    const fileName = `${order} ${spec} - ${title}${status}.webm`.replace(/[\\/:*?"<>|]/g, '_');
    fs.copyFileSync(video.path, path.join(this.outputDir, fileName));
  }

  onEnd(): void {
    const count = fs.readdirSync(this.outputDir).length;
    console.log(`\nĐã lưu ${count} video vào ${this.outputDir}`);
  }

  printsToStdio(): boolean {
    return false;
  }
}
