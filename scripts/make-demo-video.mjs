// Ghép toàn bộ video trong recordings/ thành 1 video demo (MP4) để đăng YouTube.
// Cần chạy npm run test:record trước, và máy phải có ffmpeg bản đầy đủ (có drawtext).
// Cách dùng: npm run video:demo   (hoặc đặt FFMPEG_PATH nếu ffmpeg chưa có trong PATH)
import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const INPUT_DIR = path.join(ROOT, 'recordings');
const OUTPUT_DIR = path.join(ROOT, 'demo-video');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'Automation-Test-Demo.mp4');
const FFMPEG = process.env.FFMPEG_PATH || findWingetFfmpeg() || 'ffmpeg';

// Trên Windows, ffmpeg cài bằng winget chỉ có trong PATH sau khi khởi động lại VS Code/terminal,
// nên tìm thẳng trong thư mục cài đặt của winget.
function findWingetFfmpeg() {
  if (process.platform !== 'win32' || !process.env.LOCALAPPDATA) return null;
  const links = path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe');
  if (fs.existsSync(links)) return links;
  const packages = path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WinGet', 'Packages');
  if (!fs.existsSync(packages)) return null;
  for (const pkg of fs.readdirSync(packages).filter((d) => d.startsWith('Gyan.FFmpeg'))) {
    for (const build of fs.readdirSync(path.join(packages, pkg))) {
      const exe = path.join(packages, pkg, build, 'bin', 'ffmpeg.exe');
      if (fs.existsSync(exe)) return exe;
    }
  }
  return null;
}

// Font có hỗ trợ tiếng Việt
const FONT = process.platform === 'win32' ? 'C\\:/Windows/Fonts/segoeui.ttf' : '/System/Library/Fonts/Supplemental/Arial.ttf';
const FONT_BOLD = process.platform === 'win32' ? 'C\\:/Windows/Fonts/segoeuib.ttf' : '/System/Library/Fonts/Supplemental/Arial Bold.ttf';

const MODULE_NAMES = {
  auth: 'Đăng ký & Đăng nhập',
  booking: 'Đặt phòng (Booking Flow)',
  home: 'Trang chủ',
  result: 'Trang kết quả tìm kiếm',
  'room-detail': 'Chi tiết phòng (Room Details)',
  search: 'Thanh tìm kiếm',
};

const ENCODE = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-pix_fmt', 'yuv420p', '-r', '25', '-an'];
const SIZE = '1280x720';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'demo-video-'));
let textId = 0;

function ffmpeg(args) {
  const res = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { cwd: tmpDir, encoding: 'utf8' });
  if (res.error) throw new Error(`Không chạy được ffmpeg (${FFMPEG}): ${res.error.message}`);
  if (res.status !== 0) throw new Error(`ffmpeg lỗi:\n${res.stderr}`);
}

// Ghi chữ ra file để drawtext đọc (tránh lỗi escape với tiếng Việt và ký tự đặc biệt)
function textFile(text) {
  const name = `t${textId++}.txt`;
  fs.writeFileSync(path.join(tmpDir, name), text, 'utf8');
  return name;
}

function drawText(text, { size, y, bold = false, color = 'white' }) {
  return `drawtext=fontfile='${bold ? FONT_BOLD : FONT}':textfile=${textFile(text)}:fontsize=${size}:fontcolor=${color}:x=(w-text_w)/2:y=${y}`;
}

// Màn hình tiêu đề nền tối, mỗi dòng chữ căn giữa
function makeCard(fileName, lines, seconds) {
  const filters = lines.map((line) => drawText(line.text, line)).join(',');
  ffmpeg(['-f', 'lavfi', '-i', `color=c=0x1e1e2e:s=${SIZE}:d=${seconds}:r=25`, '-vf', filters, ...ENCODE, fileName]);
  return fileName;
}

// Chuẩn hóa 1 video test về cùng định dạng; video bug có thêm nhãn đỏ ở góc phải
function makeClip(fileName, input, isBug) {
  const filters = [`scale=${SIZE.replace('x', ':')}`];
  if (isBug) {
    filters.push(
      `drawtext=fontfile='${FONT_BOLD}':textfile=${textFile('BUG ĐÃ BIẾT')}:fontsize=26:fontcolor=white:box=1:boxcolor=0xd32f2f:boxborderw=12:x=w-text_w-30:y=24`
    );
  }
  ffmpeg(['-i', input, '-vf', filters.join(','), ...ENCODE, fileName]);
  return fileName;
}

function main() {
  if (!fs.existsSync(INPUT_DIR)) throw new Error('Chưa có thư mục recordings/. Hãy chạy npm run test:record trước.');
  const videos = fs.readdirSync(INPUT_DIR).filter((f) => f.endsWith('.webm')).sort((a, b) => a.localeCompare(b, 'vi'));
  if (videos.length === 0) throw new Error('Thư mục recordings/ không có video nào.');

  // Tên file dạng: "02 booking - TC16 - Đặt phòng thành công.webm"
  const modules = [];
  for (const file of videos) {
    const key = file.match(/^\d+ (.+?) - /)?.[1] ?? 'khac';
    let mod = modules.find((m) => m.key === key);
    if (!mod) modules.push((mod = { key, files: [] }));
    mod.files.push(file);
  }
  const bugCount = videos.filter((f) => f.includes('(BUG)')).length;

  const parts = [];
  console.log('Tạo màn hình giới thiệu...');
  parts.push(
    makeCard('intro.mp4', [
      { text: 'AUTOMATION TEST DEMO', size: 64, y: 190, bold: true, color: '0xff5a5f' },
      { text: 'Cyberbnb  -  demo5.cybersoft.edu.vn', size: 36, y: 290 },
      { text: 'Playwright + TypeScript  |  Page Object Model  |  GitHub Actions CI', size: 26, y: 350, color: '0xbbbbbb' },
      { text: `${videos.length} test case  •  ${modules.length} module  •  ${bugCount} bug đã phát hiện`, size: 32, y: 430 },
      { text: 'Testing16 - Airbnb Team 2', size: 26, y: 520, color: '0xbbbbbb' },
    ], 5)
  );

  modules.forEach((mod, i) => {
    const name = MODULE_NAMES[mod.key] ?? mod.key;
    const modBugs = mod.files.filter((f) => f.includes('(BUG)')).length;
    console.log(`Module ${i + 1}/${modules.length}: ${name} (${mod.files.length} video)`);
    parts.push(
      makeCard(`module-${i}.mp4`, [
        { text: `MODULE ${i + 1}/${modules.length}`, size: 30, y: 250, color: '0xff5a5f', bold: true },
        { text: name, size: 56, y: 310, bold: true },
        { text: `${mod.files.length} test case${modBugs ? `  •  ${modBugs} bug` : ''}`, size: 30, y: 400, color: '0xbbbbbb' },
      ], 2.5)
    );
    mod.files.forEach((file, j) => {
      parts.push(makeClip(`clip-${i}-${j}.mp4`, path.join(INPUT_DIR, file), file.includes('(BUG)')));
    });
  });

  parts.push(
    makeCard('outro.mp4', [
      { text: 'KẾT QUẢ', size: 56, y: 220, bold: true, color: '0xff5a5f' },
      { text: `${videos.length - bugCount} test pass  •  ${bugCount} bug đã biết (đánh dấu test.fail)`, size: 34, y: 320 },
      { text: 'Báo cáo chi tiết: Playwright HTML Report trên GitHub Actions', size: 26, y: 400, color: '0xbbbbbb' },
      { text: 'Cảm ơn đã theo dõi!', size: 36, y: 490, bold: true },
    ], 4)
  );

  console.log('Ghép video...');
  fs.writeFileSync(path.join(tmpDir, 'list.txt'), parts.map((p) => `file '${p}'`).join('\n'));
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  ffmpeg(['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', '-movflags', '+faststart', OUTPUT_FILE]);

  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log(`\nXong: ${OUTPUT_FILE}`);
}

try {
  main();
} catch (err) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.error(err.message);
  process.exit(1);
}
