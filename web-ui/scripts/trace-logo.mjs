// logo.png → logo.svg（potrace 矢量化——构建时工具，运行时零依赖）
// 用法：npm run trace-logo（logo.png 更新后重转）
// logo.png 应为已裁切透明边的版本（scripts/trim-logo.py 生成）
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const potrace = require('potrace');

const png = fs.readFileSync('public/logo.png');
potrace.trace(png, { threshold: 128, turdsize: 2, optcurve: true, turnpolicy: 'minority' }, (err, svg) => {
  if (err) { console.error('trace failed:', err); process.exit(1); }
  fs.writeFileSync('public/logo.svg', svg);
  console.log('logo.svg written:', svg.length, 'bytes');
});
